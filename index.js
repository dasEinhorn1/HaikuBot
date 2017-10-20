/*
* This is the main source for Haiku-Bot (heroku runs this).
* PROJECT STATEMENT:
* 	HaikuBot is a twitter bot who just wants to get good at writing avant-garde haikus.
*	It speaks only through haiku, and is built to tweet out a haiku every 30 minutes.
*	It does so by utilizing a few different node.js libraries (you can find them all in
*	package.js) and the Wordnik API.

* 	HaikuBot does not necessarily mimic someone, a budding poet perhaps, but it does
* speak to something lots of us find relatable. In its current form, Haiku-Bot is
* just sort of taking shots in the dark. It doesn’t know any language aside from
* the code on which it runs, and even that is out of its hands. It really only
* knows how to ask for a string of characters, count the syllables in each
* distinct word, and spit out a randomly generated haiku from those words. It
* only works off of the data fed into it by the world around it. Essentially,
* Haiku-Bot is trying to make art in a world which has very little meaning to
* it. I really relate to that struggle. I am someone who doesn’t think things
* have inherent meaning, but rather that we, as cognitive beings, give things
* meaning for ourselves. When Haiku-Bot spits out a witty haiku based on random
* chance, we are the ones who assign meaning to that haiku. We try to find some
* underlying meaning despite knowing that Haiku Bot has no better grasp on meaning
* than we do. There is something to be said for that experience.
*
* 	That said, Haiku-Bot is eager to learn and become better. While its current
* iteration is only capable of spitting out haikus, it will have its true debut
* at the CM Showcase. By that time, Haiku-Bot will be capable of learning from
* its followers and better correcting its syllable counting capabilities. It will
* also be able to tell its followers whether their #haiku meets its criteria.
* Additionally, I will be fine-tuning its Wordnik calls to allow for better,
* more interesting word choices. Once that happens, hopefully you will see the
* true potential of Haiku-Bot as an example of the “Eliza Effect.” I know that
* the more I have worked with it, the more I have come to love it.
*
* You can find and/or follow HaikuBot at https://twitter.com/iamhaikubot
*
*/

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
			console.log("tweeted");
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

//updatedVersionTweet()
H.haikuGenerator().then(haiku => safeTweet(haiku));

if (!DEBUG){
	setInterval(function() {
		H.haikuGenerator().then(haiku => safeTweet(haiku));
	}, .5 * 1000 * 60 * 60);
}
