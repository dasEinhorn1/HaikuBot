// Our Twitter library
var Twit = require('twit');

// We need to include our configuration file
var T = new Twit(require('./config.js').twitter); 

function tweet(text) {
	T.post('statuses/update',
					{ status: text },
					function(err, data, response) {
						console.log(err);
	});
}

function validateTweet(text) {

}

let helloWorld = function() {
	tweet('Hello world! I am ChefBot');
}
