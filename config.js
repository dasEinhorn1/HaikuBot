// Put your own Twitter App keys here. See README.md for more detail.
const secrets = require('./secrets.js');
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
  twitter : secrets.twitter,
  wordnik: secrets.wordnik,
  DEBUG: true,
  setUpdated: setUpdated,
  isUpdated: isUpdated
}
