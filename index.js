// Our Twitter library
var Twit = require('twit');
const H = require('./haiku.js');
// We need to include our configuration file
var T = new Twit(require('./config.js').twitter);
var DEBUG = require('./config.js').DEBUG;
var updated = function() {return require('./config.js').isUpdated()};
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
	return text.length > 0;
}

function safeTweet(text) {
	if (text == undefined) throw "Tweet is undefined"
	if (!validateTweet(text)) throw "Tweet is too long " + text.length + " chars";
	return tweet(text);
}

function updatedVersionTweet() {
	if (!updated()) {
		return;
	} else {
		return tweet(H.getRandomUpdatePhrase());
		require('./config').setUpdated(DEBUG);
	}
}

updatedVersionTweet()

setTimeout(() => H.haikuGenerator().then(haiku => safeTweet(haiku)), 6000);

if (!DEBUG){
	setInterval(function() {
		H.haikuGenerator().then(haiku => safeTweet(haiku));
	}, .5 * 1000 * 60 * 60);
}
