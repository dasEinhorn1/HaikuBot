const rp = require('request-promise');
const f = require('util').format;
const W_KEY = require('./config').wordnik;
const WORD_LINK = "http://api.wordnik.com:80/v4/word.json/"
// "http://api.wordnik.com:80/v4/word.json/"
// "stupid/"
// "relatedWords?useCanonical=false"
// "&relationshipTypes=synonym"
// "&limitPerRelationshipType=10000"
// "&api_key="
let pick = function(arr) {
  let picked = arr[Math.floor(Math.random() * arr.length)];
  return picked;
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
  synonyms = []
  return rp(options);
}

var getRandomSynonym = function(word, count = 100) {
  return getSynonyms(word, count)
    .then(body => {
      return pick(body[0].words);
    });
}

module.exports = {
  getSynonyms: getSynonyms,
  getRandomSynonym: getRandomSynonym
}
