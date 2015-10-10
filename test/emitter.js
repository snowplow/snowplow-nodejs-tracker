/*
 * Copyright (c) 2014-2015 Snowplow Analytics Ltd. All rights reserved.
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
var nock = require('nock');
var emitter = require('../lib/emitter');

var endpoint = 'd3rkrsqld9gmqf.cloudfront.net';

var getMock = nock('http://' + endpoint, {
					filteringScope: function(scope) {
						return true;
					}
				})
				.persist()
				.filteringPath(function () {return '/'})
				.get('/')
				.reply(200, function(uri, response){
					return uri;
				});

var postMock = nock('http://' + endpoint, {
					filteringScope: function(scope) {
						return true;
					}
				})
				.matchHeader('content-type', 'application/json; charset=utf-8')
				.persist()
				.filteringRequestBody(function () {return '*'})
				.post('/com.snowplowanalytics.snowplow/tp2', '*')
				.reply(200, function(uri, body){
					return JSON.parse(body).data[0];
				});

describe('emitter', function () {

	describe('#input', function () {

		before(function () {
			nock.disableNetConnect();
		});

		after(function () {
			nock.cleanAll();
		});

		it('should send an HTTP GET request', function(done) {
			var e = emitter(endpoint, 'http', 80, 'get', null, function (error, body, response) {
				assert.deepEqual(response, '/i?a=b');
				done();
			});
			e.input({a: 'b'});
		});

		it('should send an HTTP POST request', function(done) {
			var e = emitter(endpoint, 'http', null, 'post', 1, function (error, body, response) {
				assert.deepEqual(response, {a: 'b'});
				done();
			});
			e.input({a: 'b'});
		});

		it('should send an HTTPS GET request', function(done) {
			var e = emitter(endpoint, 'https', 443, 'get', null, function (error, body, response) {
				assert.deepEqual(response, '/i?a=b');
				done();
			});
			e.input({a: 'b'});
		});

		it('should not send requests if the buffer is not full', function(done) {
			var e = emitter(endpoint, 'https', null, 'post', null, done);
			e.input({});
			e.input({});
			e.input({});
			done();
		});

	});
});
