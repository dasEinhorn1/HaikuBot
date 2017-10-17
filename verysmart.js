const wordnik = require('./wordnik');

let getSmartPost = function() {
  // gets an intelligent post
  // You will never understand *fencing* like I do. Probably because of your "low iq"
}

let giveSmartAnswer = function(question) {
  // gives a 'smart' answer to a question
  tokens = question.split(' ');
  for (let i = 0; i < tokens.length; i++)
}

let getSmartGreeting = function() {
  // gives a smart greeting like
  // --Greetings, congratulations on following the smartest bot on Earth
  // --Hello human, I have an IQ of 185. Yours is likely lower, but don't feel bad
}

var getStupidDescriptor = function() {
  return wordnik.getRandomSynonym("stupid");
}

var getSmartDescriptor = function() {
  return wordnik.getRandomSynonym("intelligent");
}

var getRandomIQ = function(high= true) {
  if (high) {
    return Math.floor(Math.random() * 50) + 175
  } else {
    return Math.floor(Math.random() * 50);
  }
}

getSmartDescriptor()
  .then(synonym => {
    return "Not everyone can be as " + synonym + " as me. ";
  }).then(text => {
    return {iq: getRandomIQ(), text: text};
  }).then(textAndIQ => {
    return textAndIQ.text + "I have an IQ of " + textAndIQ.iq;
  }).then(text => console.log(text))
  .catch(err => console.log(err));
