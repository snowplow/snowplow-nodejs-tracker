// npm install node-uuid

// Random generator
var uuid = require('node-uuid');

// Initialization
var snowplow = require('snowplow-tracker');
var emitter = snowplow.emitter;
var tracker = snowplow.tracker;
var errors = [],
    successes = [],
    unknowns = [];

// Sent event counter
var sentEventCounter = 0;
var buffer = 10;
var max = 10000;

var collector = '';

function random(low, high) {
    return Math.random() * (high - low) + low;
}

function printTime() {
    if (sentEventCounter == 1) {
        console.log(new Date());
    }
    if (sentEventCounter == max / buffer) {
        console.log(new Date());
    }
}


function trackCallback(error, body, response) { // Callback called for each request
    sentEventCounter++;
    printTime();
    if (error) {
        errors.push({
            'error': error,
            'sentEventCounter': sentEventCounter,
            'response': response,
            'body': body
        });
    } else if (body.statusCode === 200){
        successes.push(sentEventCounter);
    } else {
        unknowns.push({
            'error': error,
            'body': body,
            'response': response,
            'sentEventCounter': sentEventCounter
        });
    }
}

var e = emitter(collector, 'http', 8080, 'POST', buffer, trackCallback, {maxSockets: 4});
var t = tracker([e], 'myTracker', 'nodejs-stress-test', false);

// Getters
function getSuccesses() { return successes; }
function getErrors() { return errors; }
function getUnknowns() { return unknowns; }

function generateEvent() {
    var rnd = uuid.v4();
    var pageView = {
        'pageUrl': 'http://example.com/' + rnd,
        'pageTitle': rnd,
        'referrer': rnd
    };
    var context = {
		'schema': 'iglu:com.snowplowanalytics.snowplow/geolocation_context/jsonschema/1-1-0',
		'data': {
			'latitude': random(-80, 85),
			'longitude': random(-200, 200),
		}
	};
    t.trackPageView(pageView.pageUrl, pageView.pageTitle, pageView.referrer, [context]);
}

function start() {
    for (var i = 0; i < max; i++) {
        generateEvent();
    }
}

module.exports = { 
    getErrors: getErrors, 
    getSuccesses: getSuccesses, 
    getUnknowns: getUnknowns, 
    start: start 
};
