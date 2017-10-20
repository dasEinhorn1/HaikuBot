// Put your own Twitter App keys here. See README.md for more detail.
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
  twitter : {
    consumer_key:         'TogQqdwHks9x7OVB4NiKqnbbx',
    consumer_secret:      'nyEw1olHXPRiwc2SnOVIhFBT2cYq4FhtIoS1BFNmf9tjvmbMT1',
    access_token:         '919611644057145345-toJIgS9OglojcUoxSH5PztiQ4OtVCRA',
    access_token_secret:  'abKRdnrZgIv42x5WqF3HCHsSF5hY80ty748CZv7NhUOuK'
  },
  edamam : {
    key : '7225399e8702f65ae920d9c9614abed5',
    id : 'fa082203'
  },
  quoteGen: 'kua01jbaLpmshXStNqVqnVmnUfoAp1GnmFIjsn9Nk02QrfuBO2',
  wordnik: '7c69e6ec42b84b75a10050db2c302d806a45901f01cc35abf',
  //wordnik: 'a2a73e7b926c924fad7001ca3111acd55af2ffabf50eb4ae5',
  FIXTURE: 'fix.json',
  DEBUG: false,
  setUpdated: setUpdated,
  isUpdated: isUpdated
}
