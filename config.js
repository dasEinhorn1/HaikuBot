// Put your own Twitter App keys here. See README.md for more detail.
var secrets = undefined;
try {
  require('./secrets.js');
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
  twitter : (secrets) ? secrets.twitter : JSON.parse(process.env.TWITTER_KEYS),
  wordnik: (secrets) ? secrets.wordnik : process.env.WORDNIK_KEYS,
  DEBUG: true,
  setUpdated: setUpdated,
  isUpdated: isUpdated
}
