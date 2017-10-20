const rp = require('request-promise');
const syllable = require('syllable');
const generator = require("random-word-syllables");
const f = require('util').format;
const W_KEY = require('./config').wordnik;
const WORD_LINK = "http://api.wordnik.com:80/v4/word.json/";
const WORDS_LINK = "http://api.wordnik.com:80/v4/words.json/";
const INCLUDE_PARTS = "noun,verb,article,adverb,adjective";
const EXCLUDE_PARTS = "family-name,given-name,affix,suffix,abbreviation";

Array.prototype.pick = function() {
  let picked = this[Math.floor(Math.random() * this.length)];
  return picked;
}

let getRandomWords = function(count=30, included=INCLUDE_PARTS,
    excluded=EXCLUDE_PARTS, length={min:1, max:-1}) {
  let options = {
    uri: WORDS_LINK + "randomWords?",
    qs: {
      hasDictionaryDef: 'true',
      minCorpusCount: 1000,
      maxCorpusCount: -1,
      minDictionaryCount: 2,
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

let sortBySyllables = function(wordList) {
  let bySyll = {};
  for (let word of wordList) {
    let s = syllable(word);
    if (bySyll[s] === undefined) {
      bySyll[s] = [];
    }
    bySyll[s].push(word);
  }
  return bySyll;
}

let getSynonyms = function(word, count = 30) {
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

let generateCorpus = function(wordList) {
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

let generateAssociatedWords = function(word) {
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
  return rp(options);
}

module.exports = {
  getRandomWords: getRandomWords,
  sortBySyllables: sortBySyllables
}
