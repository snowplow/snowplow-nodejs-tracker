"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runStressTest = void 0;
const snowplow_tracker_1 = require("snowplow-tracker");
const uuid_1 = require("uuid");
const fs = require('fs');
const callback = function (error, response) {
    // Callback called for each request
    if (error) {
        console.log(error, 'Request error');
    }
    else {
        console.log('Event Sent with response: ', response);
    }
};
const configfile = fs.readFileSync('stressconfig.json');
const config = JSON.parse(configfile);
if (config.emitter == "grpc") {
    var e = snowplow_tracker_1.grpcEmitter(config.endpoint, config.port, config.maxBatchSize, callback, config.secureConnection);
}
else if (config.emitter == "got") {
    var e = snowplow_tracker_1.gotEmitter(config.endpoint, config.secureConnection === false ? snowplow_tracker_1.HttpProtocol.HTTP : snowplow_tracker_1.HttpProtocol.HTTPS, config.port, snowplow_tracker_1.HttpMethod.POST, config.maxBatchSize, undefined, undefined, callback);
}
else {
    throw new Error('Emitter must be set to either "grpc" or "got"');
}
const t = snowplow_tracker_1.tracker([e], 'myTracker', 'stress-test', false);
function runStressTest() {
    var exp;
    for (exp = 1; exp <= config.exponentialIterations; exp++) {
        var i;
        for (i = 0; i < config.baseSampleSize ** exp; i++) {
            console.log(i);
            t.setDomainUserId(uuid_1.v4());
            t.trackUnstructEvent({
                "schema": "iglu:com.snowplowanalytics.snowplow/application_error/jsonschema/1-0-1",
                "data": {
                    "programmingLanguage": "JAVASCRIPT",
                    "message": "THIS TEST"
                }
            }, [{
                    "schema": "iglu:com.snowplowanalytics.snowplow/web_page/jsonschema/1-0-0",
                    "data": {
                        "id": uuid_1.v4()
                    }
                },
                {
                    "schema": "iglu:com.snowplowanalytics.snowplow/client_session/jsonschema/1-0-1",
                    "data": {
                        "userId": uuid_1.v4(),
                        "sessionIndex": i,
                        "previousSessionId": uuid_1.v4(),
                        "storageMechanism": "SQLITE",
                        "firstEventId": uuid_1.v4()
                    }
                }]);
        }
    }
    e.flush();
}
exports.runStressTest = runStressTest;
runStressTest();
