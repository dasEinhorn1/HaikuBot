const W = require('./wordnik.js');

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

var makeLineByPrepPhrase = function({syllLeft, pos}) {
  let prep = ["on","of","in", "with","for", "by"].pick();
  syllLeft -= 2;
  //5 or 3
  let maxSylls = syllLeft - 1;
  let availableSylls = Object.keys(pos.nouns).filter(k => {
    return (k < maxSylls && (syllLeft - k) in pos.nouns)
  });
  let s1 = availableSylls.pick();
  let n1 = pos.nouns[s1].pick().word;
  syllLeft -= s1;
  console.log("N1 Syll: " + s1);
  console.log("N2 Syll: " + syllLeft);
  n2 = pos.nouns[syllLeft].pick().word;
  let l = n1 + " " + prep + " the " + n2;
  return {line: l};
}

var makeLineBySubjectVerb = function({syllLeft, pos}) {
  syllLeft -= 1;
  let maxSylls = syllLeft - 1;
  let nounSylls = Object.keys(pos.nouns).filter(k => {
    return (k < maxSylls && (syllLeft - k) in pos.verbs)
  });
  let s1 = nounSylls.pick();
  let n1 = pos.nouns[s1].pick().word;
  syllLeft -= s1;
  let v1 = pos.verbs[syllLeft].pick().word;
  console.log("Sub1 Syll: " + s1);
  console.log("Ver1 Syll: " + syllLeft);
  let l = "the " + n1 + " " + v1;
  if (!v1.endsWith("ing") && !v1.endsWith("ed")) {
    l = v1 + " the " + n1;
  }
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
  return W.getVerbs(2500)
    .then(vs => W.syllabizeWords(vs))
    .then(vs => {
      pos.verbs = vs;
      return pos;
    })
}

var updateAdverbs = function(pos={}) {
  return W.getAdverbs(2500, 15)
    .then(avs => W.syllabizeWords(avs))
    .then(avs => {
      pos.adverbs = avs;
      return pos;
    });
}

var updateNouns = function(pos={}) {
  return W.getNouns(1500)
    .then(nouns => W.syllabizeWords(nouns))
    .then(nouns => {
      pos.nouns = nouns;
      return pos;
    });
}

var updateAdjectives = function(pos={}) {
  return W.getAdjectives(1500)
    .then(adjs => W.syllabizeWords(adjs))
    .then(adjs => {
      pos.adjectives = adjs;
      return pos;
    });
}

var updatePartsOfSpeech = function() {
  return updateVerbs()
    .then(pos => updateAdverbs(pos))
    .then(pos => updateNouns(pos))
    .then(pos => updateAdjectives(pos));
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
      used : used,
      pos: pos
    }
    //TODO: decide on structure of the line (get a specific function)
    if (i < 1) {
      makeLine = makeLineByVerbAdverb;
    } else if (i == 2) {
      makeLine = makeLineByPrepPhrase;
    } else {
      makeLine = makeLineBySubjectVerb;
    }
    // while the syllables have not been exhausted
    makeLine = [
      makeLineByRandom,
      makeLineByVerbAdverb,
      makeLineByPrepPhrase,
      makeLineBySubjectVerb
    ].pick();
    ml = makeLine(options)
    let line = ml.line;
    used = ml.used;
    haiku += line + "\n";
  }
  return haiku;
}

let haikuGenerator = function() {
  return updatePartsOfSpeech()
    .then( pos => {
      return W.getRandomWords(300, W.INCLUDE_PARTS, W.EXCLUDE_PARTS)
        .then(wordList => {
          wordList = wordList.map(w => w.word);
          return W.sortBySyllables(wordList);
        })
        .then(sortedWords => makeHaiku(sortedWords, pos))
  });
}

module.exports = {
  haikuGenerator, getRandomUpdatePhrase
}
