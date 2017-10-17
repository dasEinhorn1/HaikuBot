const unirest = require('unirest');
const fs = require('fs');
const translate = require('google-translate-api');
const DEBUG = require('./config').DEBUG;
const FIXTURE = require('./config').FIXTURE;
const W_KEY = require('./config').wordnik

let pick = function(arr) {
  let picked = arr[Math.floor(Math.random() * arr.length)];
  return picked;
}

let formatQuotes = function(quotes, callback= console.log) {
  let validQuotes = quotes.filter((quote) => {
    return quote.quote.length <= 140;
  });

  return callback(pick(validQuotes));
}

let getRawQuotes= function(callback=console.log, ops={cat:'famous', ct:2}) {
  if (DEBUG) {
    return getDummyQuotes(callback);
  }
  let text = "https://andruxnet-random-famous-quotes.p.mashape.com/?cat="
    + ops.cat + "&count=" + ops.ct;
  unirest.post(text)
  .header("X-Mashape-Key", require('./config').quoteGen)
  .header("Content-Type", "application/x-www-form-urlencoded")
  .header("Accept", "application/json")
  .end(function(response) {
    console.log(5);
    console.log(response.statusType);
    return formatQuotes(response.body, callback);
  });
}

let getDummyQuotes = function(callback=console.log) {
  fs.readFile(FIXTURE, (err, data) => {
    if (err)
      throw err;
    let body = JSON.parse(data);
    return formatQuotes(body, callback);
  })
}

let randomLang = function() {
  let langs = [
    'af', 'fi', 'ar', 'la', 'eu', 'bn', 'zh-TW',
    'de', 'hi', 'es', 'ru', 'it', 'fr'
  ];
  let index = Math.floor(Math.random() * langs.length)
  return langs[index];
}

let getClose = function(q, times, callback) {
  if (times === 0) {
    translate(q.quote, {to: 'en'}).then(res => {
      q.quote = res.text;
      return callback(q);
    }).catch(err => {
      console.log(err);
    });
  } else {
    translate(q.quote, {to: randomLang()}).then(res => {
      q.quote = res.text;
      return getClose(q, times - 1, callback);
    });
  }
}

let getMisunderstandingType = function() {
  return pick(["rhyme", "synonym"]);
}

let getCloseByTelephone = function(q, times, callback) {
  if (times === 0) {
    return callback(q);
  }
  let words = q.quote.split(' ');
  let index = Math.floor(Math.random() * words.length)
  let text = "http://api.wordnik.com:80/v4/word.json/"
  text += words[index];
  text += "/related?";
  text += "useCanonical=true";
  text += "&relationshipTypes=" + getMisunderstandingType();
  text += "&limit=100";
  text += "&api_key=" + W_KEY;
  unirest.get(text)
  .end(function(response) {
    console.log(response.body);
    console.log(response.code);
    words[index] = pick(response.body[0].words);
    q.quote = words.join(' ');
    return getCloseByTelephone(q, times - 1, callback);
  });
}

let misquote = function(q, callback=console.log) {
  getClose(q, 3, callback);
}

let stringQuote = function(q) {
  return q.quote + " -" + q.author;
};

module.exports = {
  stringQuote: stringQuote,
  getRawQuotes: getRawQuotes,
  misquote: misquote
}
