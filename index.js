// Our Twitter library
var Twit = require('twit');
var Q = require('./quote.js')
// We need to include our configuration file
var T = new Twit(require('./config.js').twitter);
var DEBUG = require('./config.js').DEBUG;

function tweet(text) {
	if (DEBUG) {
		console.log(text);
		return;
	}
	T.post('statuses/update',
					{ status: text },
					function(err, data, response) {
						console.log(err);
	});
}

function validateTweet(text) {
  let charsLeft = text.length - 140;
	console.log(charsLeft);
	return text.length > 0;
}

function safeTweet(text) {
	if (text == undefined) throw "Tweet is undefined"
	if (!validateTweet(text)) throw "Tweet is too long. " + text.length + " chars" ;
	return tweet(text);
}

var tweetQuote = function(q) {
	return safeTweet(Q.stringQuote(q));
}
