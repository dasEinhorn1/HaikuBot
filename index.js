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
const fs = require('fs');
// We need to include our configuration file
var T = new Twit(require('./config.js').twitter);
var DEBUG = require('./config.js').DEBUG;
var updated = function() {return require('./config.js').isUpdated()};

function tweet(text, ops = {}) {
	if (DEBUG) {
		console.log(text);
		return;
	}
	ops.status = text;
	T.post('statuses/update', ops, (err, data, response) => {
			if (err !== undefined) {
				console.log(err);
			} else {
				console.log("tweeted");
			}
	});
}

function retweetLatest(history) {
	var mediaArtsSearch = {q: "#haiku", count: 10, result_type: "recent"};
	return new Promise((resolve, reject) => {
		T.get('search/tweets', mediaArtsSearch, function (error, data) {
		  if (!error) {
				var rtID = data.statuses
					.filter(rt => !(rt.id_str in history.rts))[0].id_str;
				resolve(rtID);
		  } else {
				reject("Error with # search: " + error);
		  }
		});
	})
	.then(rtID => {
		history.rts[rtID] = 1;
		if (!DEBUG) {
			T.post('statuses/retweet/' + rtID, {}, function (error, response) {
				if (response) {
					console.log('Success! Check your bot, it should have retweeted something.')
				}
				if (error) {
					throw('There was an error with Twitter:', error);
				}
			});
		} else {
			console.log('I Would have retweeted: ' + rtID);
		}
		return history;
	});
}

function followAMentioner() {
	new Promise((resolve, reject) => {
		let ops = { count:50, include_rts:1 };
		return T.get('statuses/mentions_timeline', ops, (err, reply) => {
			if (err !== null) {
				reject(err);
			} else {
				var sn = reply.pick().user.screen_name;
				resolve(sn);
			}
		});
	}).then(sn => {
		return followMentioner(sn)
	})
}

var followMentioner = function(sn) {
		if (DEBUG) {
			console.log(sn);
		} else {
			//Now follow that user
			T.post('friendships/create', {screen_name: sn }, function (err, reply) {
				if (err) {
					throw err;
				} else {
					console.log('Followed: ' + sn);
				}
			});
		}
}

var respondToMention = function(history) {
	return new Promise((resolve, reject) => {
		return T.get('statuses/mentions_timeline', { count:100, rts:0 }, (err, reply) => {
			if (err) {
				reject(err);
			} else {
				var mention = reply.filter(m => !(m.id_str in history.replies)).pick();
				if (mention == undefined) {
					reject("No new mentions");
				} else {
					var mentionContent = mention.text.replace('@iamhaikubot','').trim();
					mentionId = mention.id_str;
					history.replies[mentionId] = 1;
					mentioner = '@' + mention.user.screen_name;
					var text = mentioner + "\n" + H.respondToHaiku(mentionContent);
					tweet(text, { in_reply_to_status_id: mentionId });
					resolve({history: history, mentioner: mention.user.screen_name});
				}
			}
		});
	}).then((out) => {
		console.log(out);
		followMentioner(out.mentioner);
		return out.history;
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

function hoursToMs(hours) {
	return hours * 1000 * 60 * 60;
}

function takeRandomAction(history) {
	let choice = Math.floor(Math.random() * 7);
	// let choice = 0;
	console.log(choice);
	switch (choice) {
		case 0:
		case 1:
		case 2:
			H.haikuGenerator(history)
			.then(haiku => safeTweet(haiku))
			.catch(reason => {console.log(reason); clearInterval()});
			break;
		case 3:
		case 4:
			respondToMention(history)
			.then(history => updateHistory(history))
			.catch(err => {console.log(err); clearInterval()});
			break;
		case 5:
		case 6:
			retweetLatest(history)
			.then(history => updateHistory(history))
			.catch(err => {console.log(err); clearInterval()});
			break;
		default:
			console.log("Error");
			break;
	}
}

var main = function(history) {
	takeRandomAction(history);
	setInterval(() => takeRandomAction(history), hoursToMs(1));
	return history;
}

var readThen = function(filename) {
	return new Promise((resolve, reject) => {
		return fs.readFile(filename, (err, data) => {
			if (err)
				reject(err);
			else
				resolve(data);
		})
	});
}

var writeThen = function(filename, text) {
	return new Promise((resolve, reject) => {
		return fs.writeFile(filename, text, (err) => {
			if (err) reject(err);
			resolve(undefined);
		});
	});
}

var updateHistory = function(history) {
	if (history != undefined) {
		return writeThen('history.json', JSON.stringify(history));
	} else {
		throw "ERROR WRITING TO HISTORY";
	}
}

readThen('history.json')
	.then((data) => {
		var parsedJSON = JSON.parse(data);
		console.log(parsedJSON);
		return parsedJSON;
	})
	.then(history => main(history))
	.then(history => updateHistory(history))
	.catch(e => console.log(e))
//updatedVersionTweet()
