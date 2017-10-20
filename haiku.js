const W = require('./wordnik.js');

update_status_sayings = [
  "I am updated!\nMy haikus should be better.\nI hope you enjoy!"
];

Array.prototype.pick = function() {
  let picked = this[Math.floor(Math.random() * this.length)];
  return picked;
}

getRandomUpdatePhrase = function() {
  return update_status_sayings.pick();
}

let makeHaiku = function (sortedWords) { // words sorted by number of syllables
  let haiku = "";
  let used = {};
  let form = [5,7,5];
  for (let i = 0; i < form.length; i++) {
    syllablesLeft = form[i];
    while (syllablesLeft > 0) {
      let currentSyll = Math.floor(Math.random() * syllablesLeft) + 1;
      if (sortedWords[currentSyll] === undefined) {
        let randWord = generator.randword(currentSyll);
        while (randWord in used) {
          randWord = generator.randword(currentSyll);
        }
        haiku += randWord + " ";
      } else {
        let randWord = sortedWords[currentSyll].pick();
        if (randWord in used) {
          while (i + 1 < sortedWords[currentSyll].length &&
              sortedWords[currentSyll][i] in used) {
            i++;
            randWord = sortedWords[i];
          }
        } else {
          used[randWord] = true;
        }
        haiku += randWord + " ";
      }
      syllablesLeft -= currentSyll;
    }
    haiku += "\n";
  }
  return haiku;
}

let haikuGenerator = function() {
  let haiku = W.getRandomWords(300, W.INCLUDE_PARTS, W.EXCLUDE_PARTS)
    .then(wordList => {
      wordList = wordList.map(w => w.word);
      return W.sortBySyllables(wordList);
    })
    .then(sortedWords => makeHaiku(sortedWords))
    .catch(reason => console.log(reason.error));
  return haiku;
}

module.exports = {
  haikuGenerator: haikuGenerator,
  getRandomUpdatePhrase: getRandomUpdatePhrase
}
