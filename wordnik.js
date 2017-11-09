const rp = require('request-promise');
const syllable = require('syllable');
const generator = require("random-word-syllables");
const f = require('util').format;
const wordfilter = require('wordfilter')
const W_KEY = require('./config').wordnik;
const WORD_LINK = "http://api.wordnik.com:80/v4/word.json/";
const WORDS_LINK = "http://api.wordnik.com:80/v4/words.json/";
const INCLUDE_PARTS = "noun,verb,article,adverb,adjective";
const EXCLUDE_PARTS = "family-name,given-name,affix,suffix,abbreviation";

Array.prototype.pick = function() {
  let picked = this[Math.floor(Math.random() * this.length)];
  return picked;
}

String.prototype.count = function (sub="", allowOverlapping=false) {
    if (sub.length <= 0) return (this.length + 1);
    var ct = 0, // the count of the
        index = 0,
        step = allowOverlapping ? 1 : sub.length;

    while (true) {
        index = this.indexOf(sub, index);
        if (index >= 0) {
            ct++;
            index += step;
        } else break;
    }
    return ct;
}


var getRandomWords = function(count=30, included=INCLUDE_PARTS,
    excluded=EXCLUDE_PARTS, length={min:1, max:-1},
    corpFreq=100000, dictReq=0) {
  let options = {
    uri: WORDS_LINK + "randomWords?",
    qs: {
      hasDictionaryDef: 'true',
      minCorpusCount: corpFreq,
      maxCorpusCount: -1,
      minDictionaryCount: dictReq,
      maxDictionaryCount: -1,
      minLength: length.min,
      maxLength: length.max,
      limit: count,
      api_key: W_KEY
    },
    headers: {
      'User-Agent': 'Request-Promise'
    },
    json: true
  }
  if (included.length > 0) {
    options.qs.includePartOfSpeech=included;
  }
  if (excluded.length > 0) {
    options.qs.excludePartOfSpeech=excluded;
  }
  return rp(options);
}

var getSyllables = function(word) {
  if (false) {
    //TODO check database for corrections
  }
  return syllable(word);
}

var countSyllables = function(line) {
  let words = line.split(' ');
  let ct = 0;
  for (let word of words) {
    ct += getSyllables(word);
  }
  return ct;
}

var syllabizeWords = function(words, history) {
  let syllables = {};
  for (let word of words) {
    if (isSanitary(word.word, history)){
      let s = getSyllables(word.word);
      if (syllables[s] === undefined) {
        syllables[s] = [];
      }
      syllables[s].push(word);
    } else {
      console.log("IGNORED@: " + word.word);
    }
  }
  return syllables;
}

var isSanitary = function(word, history) {
  let sanitary = true;
  if (history) {
    sanitary = sanitary && !(word in history.words.blacklist);
  }
  sanitary = sanitary && !(wordfilter.blacklisted(word));
  return sanitary;
}

var sortBySyllables = function(wordList, history) {
  let bySyll = {};
  for (let word of wordList) {
    if (isSanitary(word, history)) {
      let s = syllable(word);
      if (bySyll[s] === undefined) {
        bySyll[s] = [];
      }
      bySyll[s].push(word);
    } else {
      console.log("IGNORED!: " + word);
    }
  }
  return bySyll;
}

var getSynonyms = function(word, count = 30) {
  let options = {
    uri: WORD_LINK + word + "/relatedWords",
    qs: {
      useCanonical: 'false',
      relationshipTypes: 'synonym',
      api_key: W_KEY
    },
    headers: {
      'User-Agent': 'Request-Promise'
    },
    json: true
  }
  options.qs.limitPerRelationshipType = count;
  return rp(options);
}

var getRandomSynonym = function(word, count = 100) {
  return getSynonyms(word, count)
    .then(body => {
      return pick(body[0].words);
    });
}

var generateCorpus = function(wordList) {
  /*
    [
      {
        word: "word"
        associated: [],
        rhymes: [],
        synonyms: []
      },
      1: {...}
    ]
  */
  wordList.map(w => {
    return new Promise( resolve => {
      generateAssociatedWords(w).then( associated => {
        console.log(associated);
      });
    });
  });
}

var getAdjectives = function(count=100) {
  return getRandomWords(count, "adjective", "proper-noun", {max:8, min: 3})
    .then(adjs => {
      return adjs.filter(adj => {
        return !/^[A-Z]/.test(adj.word);
      });
    });
}

var getNouns = function(count=1000, length = 15) {
  return getRandomWords(count, "noun", "verb", {max:length, min: 3})
    .then(nouns => {
      return nouns.filter(noun => {
        return !/^[A-Z]/.test(noun.word);
      });
    });
}

var getVerbs = function(count=1000, length = 15) {
  return getRandomWords(count, "verb", "noun", {max:length, min: 2})
    .then(verbs => {
      return verbs;
    });
}

var getAdverbs = function(count=1000, length=15) {
  return getRandomWords(count, "adverb", "noun", {max:length, min: 2})
    .then(adverbs => {
      return adverbs;
    });
}

var getPrepositions = function(count=30, length=8) {
  return getRandomWords(count, "preposition", "", {max:length, min: 2})
    .then(preps => {
      return preps;
    });
}

var generateAssociatedWords = function(word) {
  console.log(word);
  let options = {
    uri: WORD_LINK + word + "/relatedWords",
    qs: {
      useCanonical: 'false',
      relationshipTypes: 'same-context',
      limitPerRelationshipType: 1000,
      api_key: W_KEY
    },
    headers: {
      'User-Agent': 'Request-Promise'
    },
    json: true
  }
  return rp(options);text
}
module.exports = {
  getRandomWords, sortBySyllables, generator, getVerbs, getAdverbs, getNouns,
  getAdjectives, syllabizeWords, countSyllables
}
