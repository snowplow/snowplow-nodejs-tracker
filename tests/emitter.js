/*
 * Node.js tracker for Snowplow: tests/tracker.js
 * 
 * Copyright (c) 2014 Snowplow Analytics Ltd. All rights reserved.
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

var assert = require('assert');
var emitter = require('../lib/emitter');

var endpoint = 'd3rkrsqld9gmqf.cloudfront.net';

describe('emitter', function () {

	describe('#input', function () {

		it('should send an HTTP GET request', function(done) {
			var e = emitter(endpoint, 'http', 'get', null, done);
			e.input({});
		});

		it('should send an HTTP POST request', function(done) {
			var e = emitter(endpoint, 'http', 'post', 1, done);
			e.input({});
		});

		it('should send an HTTPS GET request', function(done) {
			var e = emitter(endpoint, 'https', 'get', null, done);
			e.input({});
		});

		it('should send an HTTPS POST request', function(done) {
			var e = emitter(endpoint, 'https', 'get', 1, done);
			e.input({});
		});

		it('should not send requests if the buffer is not full', function(done) {
			var e = emitter(endpoint, 'https', 'post', null, done);
			e.input({});
			e.input({});
			e.input({});
			done();
		});

	});
});
