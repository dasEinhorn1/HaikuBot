const W = require('./wordnik.js');

var verbs = [],
    adverbs = [],
    nouns = [],
    adjectives = [],
    prepositions = [];


update_status_sayings = [
  "I am updated!\nMy haikus should be better.\nI hope you enjoy!",
  "Notice anything?\nI have just been updated\nAlways improving!",
];

Array.prototype.pick = function() {
  let picked = this[Math.floor(Math.random() * this.length)];
  return picked;
}

var getRandomUpdatePhrase = function() {
  return update_status_sayings.pick();
}

var makeLineByVerbAdverb = function({syllLeft, pos}) {
  console.log("SYLL: " + syllLeft);
  var adverbSyll = Object.keys(pos.adverbs).filter(k => {
    return k < syllLeft && (syllLeft - k) in pos.verbs;
  }).pick();
  var verbSyll = syllLeft - adverbSyll;
  console.log("AV: " + adverbSyll);
  console.log("V: " + verbSyll);
  //TODO make sure this wont ever fail
  console.log("V_LEN: " + pos.verbs[verbSyll].length);
  console.log("AV_LEN: " + pos.adverbs[adverbSyll].length);
  var v = pos.verbs[verbSyll].pick().word;
  var av = pos.adverbs[adverbSyll].pick().word;
  var l = av + " " + v
  return {line: l};
}

var makeLineByRandom = function({wordList, syllLeft, line = "", used = {}}) {
    if (syllLeft < 1) return {line: line, used: used};
    // the random approach, takes a list of random words
    let currSyll = Math.floor(Math.random() * syllLeft) + 1;
    let randWord = undefined;
    // the wordList failed to have a viable word
    if (wordList[currSyll] == undefined) {
      // randWord = failSafeRandWord(currentSyll);
      console.log("wordlist was undefined");
      randWord = W.generator.randword(currSyll);
    } else {
      let wordChoices = wordList[currSyll].filter(w => !(w in used));
      if (wordChoices.length < 1) {
        //randWord = failSafeRandWord(currentSyll);
        console.log("word choices depleted");
        randWord = W.generator.randword(currSyll);
      } else { // there exists a viable word
        randWord = wordChoices.pick();
        used[randWord] = true;
      }
    }
    line += randWord + " ";
    let updates = {
      wordList: wordList,
      syllLeft: syllLeft - currSyll,
      line: line,
      used: used
    };
    return makeLineByRandom(updates);
}

var updateVerbs = function(pos={}) {
  return W.getVerbs(1500)
    .then(vs => W.syllabizeWords(vs))
    .then(vs => {
      pos.verbs = vs;
      return pos;
    })
}
var updateAdverbs = function(pos={}) {
  return W.getAdverbs(1500)
    .then(avs => W.syllabizeWords(avs))
    .then(avs => {
      pos.adverbs = avs;
      return pos;
    });
}
var updatePartsOfSpeech = function() {
  return updateVerbs()
  .then(pos => updateAdverbs(pos))
}

var makeHaiku = function (sortedWords, pos={}) { // words sorted by number of syllables
  let haiku = "";
  let used = {};
  let form = [5,7,5];
  // for each of the three lines
  for (let i = 0; i < form.length; i++) {
    let syllablesLeft = form[i];
    let options = {
      wordList: sortedWords,
      syllLeft: syllablesLeft,
      used : used
    }
    //TODO: decide on structure of the line (get a specific function)
    makeLine = makeLineByRandom;
    if (i == 0) {
      makeLine = makeLineByVerbAdverb;
      options.pos = pos;
    }
    // while the syllables have not been exhausted
    ml = makeLine(options)
    let line = ml.line;
    used = ml.used;
    haiku += line + "\n";
  }
  return haiku;
}

let haikuGenerator = function(pos) {
  let haiku = W.getRandomWords(300, W.INCLUDE_PARTS, W.EXCLUDE_PARTS)
    .then(wordList => {
      wordList = wordList.map(w => w.word);
      return W.sortBySyllables(wordList);
    })
    .then(sortedWords => makeHaiku(sortedWords, pos))
    .catch(reason => console.log(reason));
  return haiku;
}
updatePartsOfSpeech()
  .then((pos) => haikuGenerator(pos))
  .then(h => console.log(h));

module.exports = {
  haikuGenerator, getRandomUpdatePhrase
}
