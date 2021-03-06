// Put your own Twitter App keys here. See README.md for more detail.
var secrets = undefined;
try {
  secrets = require('./secrets.js');
} catch(e) {}
var updated = true;

var isUpdated = function() {
  return updated;
}

var setUpdated = function(b) {
  if (b === true) {
    updated = true;
  } else {
    updated= false
  }
}
module.exports = {
  DEBUG: (process.env.DEBUG === undefined) ? true : process.env.DEBUG != 0,
  INTERVAL: (process.env.DEBUG === undefined) ? 1 : process.env.INTERVAL,
  setUpdated: setUpdated,
  isUpdated: isUpdated
}

if (secrets != undefined) {
  module.exports.twitter = secrets.twitter;
  module.exports.wordnik = secrets.wordnik;
} else {
  module.exports.twitter = {
    consumer_key: process.env.TWITTER_C_KEY,
    consumer_secret:process.env.TWITTER_C_SECRET,
    access_token:process.env.TWITTER_ACCESS_TOKEN,
    access_token_secret:  process.env.TWITTER_ACCESS_TOKEN_SECRET
  };
  module.exports.wordnik = process.env.WORDNIK_KEY;
}
