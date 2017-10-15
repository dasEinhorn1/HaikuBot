// Our Twitter library
var Twit = require('twit');

// We need to include our configuration file
var T = new Twit(require('./config.js'));

// This is the URL of a search for the latest tweets on the '#mediaarts' hashtag.
//var mediaArtsSearch = {q: "#mediaarts", count: 10, result_type: "recent"};
let i = 0;
function helloWorld() {
	i++;
	T.post('statuses/update',
					{ status: 'HELLO WORLD! I AM CHEF BOT' },
					function(err, data, response) {
						console.log(err);
	});
}

helloWorld();
