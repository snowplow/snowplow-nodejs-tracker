import { grpcEmitter, gotEmitter, tracker, HttpProtocol, HttpMethod } from 'snowplow-tracker';
import { v4 as uuidv4 } from 'uuid';
const fs = require('fs');

const callback = function (error?: Error, response?: any) {
  // Callback called for each request
  if (error) {
    console.log(error, 'Request error');
  } else {
    console.log('Event Sent with response: ', response);
  }
}

const configfile = fs.readFileSync('stressconfig.json');
const config = JSON.parse(configfile);

if (config.emitter == "grpc") {
  var e = grpcEmitter(config.endpoint, config.port, config.maxBatchSize, callback, config.secureConnection);
} else if (config.emitter == "got") {
  var e = gotEmitter(config.endpoint,
                      config.secureConnection === false ? HttpProtocol.HTTP : HttpProtocol.HTTPS,
                      config.port,
                      HttpMethod.POST,
                      config.maxBatchSize,
                      undefined,
                      undefined,
                      callback)
} else {
  throw new Error('Emitter must be set to either "grpc" or "got"');
}

const t = tracker([e], 'myTracker', 'stress-test', false);

export function runStressTest() {
  var exp;
  for (exp = 1; exp <= config.exponentialIterations; exp++) {
    var i;
    for (i = 0; i < config.baseSampleSize ** exp; i++) {
      console.log(i)
      t.setDomainUserId(uuidv4());
      t.trackUnstructEvent({
          "schema": "iglu:com.snowplowanalytics.snowplow/application_error/jsonschema/1-0-1",
          "data": {
              "programmingLanguage": "JAVASCRIPT",
              "message": "THIS TEST"
          }
      },
      [{
        "schema": "iglu:com.snowplowanalytics.snowplow/web_page/jsonschema/1-0-0",
        "data": {
            "id": uuidv4()
        }
      },
      {
        "schema": "iglu:com.snowplowanalytics.snowplow/client_session/jsonschema/1-0-1",
        "data": {
          "userId": uuidv4(),
          "sessionIndex": i,
          "previousSessionId": uuidv4(),
          "storageMechanism": "SQLITE",
          "firstEventId": uuidv4()
          }
      }]);
    }
  }

  e.flush()
}

runStressTest();