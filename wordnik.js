const rp = require('request-promise');
const syllable = require('syllable');
const generator = require("random-word-syllables");
const f = require('util').format;
const W_KEY = require('./config').wordnik;
const WORD_LINK = "http://api.wordnik.com:80/v4/word.json/";
const WORDS_LINK = "http://api.wordnik.com:80/v4/words.json/";
const INCLUDE_PARTS = "noun,verb,article,adverb,adjective";
const EXCLUDE_PARTS = "family-name,given-name,affix,suffix,abbreviation";
// "http://api.wordnik.com:80/v4/word.json/"
// "stupid/"
// "relatedWords?useCanonical=false"
// "&relationshipTypes=synonym"
// "&limitPerRelationshipType=10000"
// "&api_key="
Array.prototype.pick = function() {
  let picked = this[Math.floor(Math.random() * this.length)];
  return picked;
}

let getRandomWords = function(count=30, included="", excluded="",
    length={min:1, max:-1}) {
  let options = {
    uri: WORDS_LINK + "randomWords?",
    qs: {
      hasDictionaryDef: 'false',
      minCorpusCount: 0,
      maxCorpusCount: -1,
      minDictionaryCount: 1,
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

let makeHaiku = function (sortedWords) { // words sorted by number of syllables
  let haiku = "";
  let form = [5,7,5];
  for (let i = 0; i < form.length; i++) {
    syllablesLeft = form[i];
    while (syllablesLeft > 0) {
      let currentSyll = Math.floor(Math.random() * syllablesLeft) + 1;
      if (sortedWords[currentSyll] === undefined) {
        haiku += generator.randword(currentSyll) + " ";
      } else {
        haiku += sortedWords[currentSyll].pick() + " ";
      }
      syllablesLeft -= currentSyll;
    }
    haiku += "\n";
  }
  return haiku;
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

let haikuGenerator = function() {
  let haiku = getRandomWords(300, INCLUDE_PARTS, EXCLUDE_PARTS)
    .then(wordList => {
      wordList = wordList.map(w => w.word);
      return sortBySyllables(wordList);
    })
    .then(sortedWords => makeHaiku(sortedWords));
  return haiku;
}

module.exports = {
  haikuGenerator: haikuGenerator
}
