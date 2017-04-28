/*
 * Node.js tracker for Snowplow: emitter.js
 * 
 * Copyright (c) 2014-2017 Snowplow Analytics Ltd. All rights reserved.
 *
 * This program is licensed to you under the Apache License Version 2.0,
 * and you may not use this file except in compliance with the Apache License Version 2.0.
 * You may obtain a copy of the Apache License Version 2.0 at http://www.apache.org/licenses/LICENSE-2.0.
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the Apache License Version 2.0 is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the Apache License Version 2.0 for the specific language governing permissions and limitations there under.
 */

var request = require('request');

/**
 * Create an emitter object which will send events to a collector
 *
 * @param string endpoint The collector to which events will be sent
 * @param string protocol "http" or "https"
 * @param number port The port for requests to use
 * @param string method "get" or "post"
 * @param number bufferSize Number of events which can be queued before flush is called
 * @param function callback Callback passed to the request function
 * @param agentOptions configuration for http.Agent class
 */
function emitter(endpoint, protocol, port, method, bufferSize, callback, agentOptions) {
	protocol = (protocol || 'http').toLowerCase();
	method = (method || 'get').toLowerCase();
	if (bufferSize === null || typeof bufferSize === 'undefined') {
		bufferSize = method === 'get' ? 0 : 10;
	}
	var portString = port ? ':' + port : '';
	var path = method === 'get' ? '/i' : '/com.snowplowanalytics.snowplow/tp2';
	var targetUrl = protocol + '://' + endpoint + portString + path;
	var buffer = [];

	/**
	 * Send all events queued in the buffer to the collector
	 */
	function flush() {
		var temp = buffer;
		buffer = [];
		if (method === 'post') {
			var postJson = {
				schema: 'iglu:com.snowplowanalytics.snowplow/payload_data/jsonschema/1-0-0',
				data: temp.map(valuesToStrings)
			};
			request.post({
				url: targetUrl,
				json: postJson,
				agentOptions: agentOptions,
				headers: {
					'content-type': 'application/json; charset=utf-8'
				}
			}, callback);

		} else {
			for (var i=0; i<temp.length; i++) {
				request.get({
					url: targetUrl,
                    agentOptions: agentOptions,
				 	qs: temp[i]
				}, callback);
			}
		}
	}

	return {
		flush: flush,
		input: function (payload) {
			buffer.push(payload);
			if (buffer.length >= bufferSize) {
				flush();
			}
		}
	};
}

/**
 * Convert all fields in a payload dictionary to strings
 *
 * @param object payload Payload on which the new dictionary is based
 */
function valuesToStrings(payload) {
	var stringifiedPayload = {};
	for (var key in payload) {
		if (payload.hasOwnProperty(key)) {
			stringifiedPayload[key] = payload[key].toString();
		}
	}
	return stringifiedPayload;
}

module.exports = emitter;
