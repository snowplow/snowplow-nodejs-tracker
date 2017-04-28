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
var querystring = require('querystring');
var snowplowTracker = require('..');
var tracker = snowplowTracker.tracker;
var emitter = snowplowTracker.emitter;
var version = snowplowTracker.version;

var endpoint = 'd3rkrsqld9gmqf.cloudfront.net';

var context = [{
	schema: 'iglu:com.acme/user/jsonschema/1-0-0',
	data: {
		type: 'tester'
	}
}];

var completedContext = JSON.stringify({
	schema: 'iglu:com.snowplowanalytics.snowplow/contexts/jsonschema/1-0-0',
	data: context
});

function getMock(method) {
	if (method === 'get') {
		return nock('http://d3rkrsqld9gmqf.cloudfront.net:80')
			.filteringPath(function () {return '/'})
			.get('/')
			.reply(200, function(uri, response){
				return querystring.parse(uri.slice(3));
			});
	} else {
		return nock('http://d3rkrsqld9gmqf.cloudfront.net')
			.matchHeader('content-type', 'application/json; charset=utf-8')
			.filteringRequestBody(function () {return '*'})
			.post('/com.snowplowanalytics.snowplow/tp2', '*')
			.reply(200, function(uri, body){
				return body;
			});
	}
}

function extractPayload(response, method) {
	if (method === 'get') {
		return JSON.parse(response);
	}
	else {
		return response.data[0];
	}
}

function checkPayload(payloadDict, expected) {
	for (var key in expected) {
		assert.strictEqual(expected[key], payloadDict[key]);
	}
	assert.deepEqual(payloadDict['co'], completedContext, 'a custom context should be attached');
	assert.ok(payloadDict['dtm'], 'a timestamp should be attached');
	assert.ok(payloadDict['eid'], 'a UUID should be attached');
}

function performTestsWithMethod(method) {
	describe('tracker', function () {

		before(function () {
			nock.disableNetConnect();
		});

		after(function () {
			nock.cleanAll();
		});

		describe('#trackPageView', function () {

			it('should send a page view event', function (done) {
				var expected = {
					tv: 'node-' + version,
					tna: 'cf',
					aid: 'cfe35',
					p: 'srv',
					e: 'pv',
					url: 'http://www.example.com',
					page: 'example page',
					refr: 'google'
				};

				var e = emitter(endpoint, 'http', null, method, 0, function (error, body, response) {
					checkPayload(extractPayload(response, method), expected);
					done.call(this, error);
				});
				var t = tracker(e, 'cf', 'cfe35', false);
				var mock = getMock(method);

				t.trackPageView('http://www.example.com', 'example page', 'google', context);
			});
		});

		describe('#trackStructEvent', function () {

			it('should send a structured event', function (done) {
				var expected = {
					tv: 'node-' + version,
					tna: 'cf',
					aid: 'cfe35',
					e: 'se',
					se_ca: 'clothes',
					se_ac: 'add_to_basket',
					se_la: undefined,
					se_pr: 'red',			
					se_va: '15'
				};

				var e = emitter(endpoint, 'http', null, method, 0, function (error, body, response) {
					checkPayload(extractPayload(response, method), expected);
					done.call(this, error);
				});
				var t = tracker(e, 'cf', 'cfe35', false);
				var mock = getMock(method);

				t.trackStructEvent('clothes', 'add_to_basket', null, 'red', 15, context);
			});
		});

		describe('#trackEcommerceTransaction', function () {

			it('should track an ecommerce transaction', function (done) {
				var items = [{
					sku: 'item-729',
					name: 'red hat',
					category: 'headgear',
					price: 10,
					quantity: 1,
					context: context
				}];
				var requestCount = items.length + 1;
				var expectedTransaction = {
					e: 'tr',
					tr_id: 'order-7',
					tr_af: 'affiliate',
					tr_tt: '15',
					tr_tx: '5',
					tr_sh: '0',
					tr_ci: 'Dover',
					tr_st: 'Delaware',
					tr_co: 'US',
					tr_cu: 'GBP'
				};
				var expectedItem = {
					e: 'ti',
					ti_sk: 'item-729',
					ti_nm: 'red hat',
					ti_ca: 'headgear',
					ti_qu: '1',
					ti_id: 'order-7',
					ti_cu: 'GBP'
				};

				var e = emitter(endpoint, 'http', null, method, 0, function (error, body, response) {
					var payloadDict = extractPayload(response, method);
					var expected = payloadDict['e'] === 'tr' ? expectedTransaction : expectedItem;

					checkPayload(payloadDict, expected);

					requestCount--;
					if (!requestCount) {
						done.call(this, error);
					}
				});
				var t = tracker(e, 'cf', 'cfe35', false);
				var mocks = [getMock(method), getMock(method)];

				t.trackEcommerceTransaction('order-7', 'affiliate', 15, 5, 0, 'Dover', 'Delaware', 'US', 'GBP', items, context);
			});
		});

		describe('#trackUnstructEvent', function () {

			it('should send a structured event', function (done) {
				var inputJson = {
					schema: 'iglu:com.acme/viewed_product/jsonschema/1-0-0',
					data: {
						price: 20
					}
				};
				var expected = {
					tv: 'node-' + version,
					tna: 'cf',
					aid: 'cfe35',
					e: 'ue',
					ue_pr: JSON.stringify({
						schema: 'iglu:com.snowplowanalytics.snowplow/unstruct_event/jsonschema/1-0-0',
						data: inputJson
					})
				};

				var e = emitter(endpoint, 'http', null, method, 0, function (error, body, response) {
					checkPayload(extractPayload(response, method), expected);
					done.call(this, error);
				});
				var t = tracker(e, 'cf', 'cfe35', false);
				var mock = getMock(method);

				t.trackUnstructEvent(inputJson, context);
			});
		});	

		describe('#trackScreenView', function () {

			it('should send a screen view event', function (done) {
				var expected = {
					tv: 'node-' + version,
					tna: 'cf',
					aid: 'cfe35',
					e: 'ue',
					ue_pr: JSON.stringify({
						schema: 'iglu:com.snowplowanalytics.snowplow/unstruct_event/jsonschema/1-0-0',
						data: {
							schema: 'iglu:com.snowplowanalytics.snowplow/screen_view/jsonschema/1-0-0',
							data: {
								name: 'title screen',
								id: '12345'
							}
						}
					})
				};

				var e = emitter(endpoint, 'http', null, method, 0, function (error, body, response) {
					checkPayload(extractPayload(response, method), expected);
					done.call(this, error);
				});
				var t = tracker(e, 'cf', 'cfe35', false);
				var mock = getMock(method);

				t.trackScreenView('title screen', '12345', context);
			});
		});	

		describe('setter methods', function () {
			it('should set user attributes', function (done) {
				var expected = {
					tv: 'node-' + version,
					tna: 'cf',
					aid: 'cfe35',
					e: 'pv',
					url: 'http://www.example.com',
					page: 'example page',
					refr: 'google',
					p: 'web',
					uid: 'jacob',
					res: '400x200',
					vp: '500x800',
					cd: '24',
					tz: 'Europe London',
					dtm: '1000000000000'
				};

				var e = emitter(endpoint, 'http', null, method, 0, function (error, body, response) {
					checkPayload(extractPayload(response, method), expected);
					done.call(this, error);
				});

				var t = tracker(e, 'cf', 'cfe35', false);

				var mock = getMock(method);

				t.setPlatform('web');
				t.setUserId('jacob');
				t.setScreenResolution(400, 200);
				t.setViewport(500, 800);
				t.setColorDepth(24);
				t.setTimezone('Europe London');

				t.trackPageView('http://www.example.com', 'example page', 'google', context, 1000000000000);
			});
		});	

		describe('base 64 encoding', function () {

			it('should base 64 encode unstructured events and custom contexts', function (done) {
				var inputJson = {
					schema: 'iglu:com.acme/viewed_product/jsonschema/1-0-0',
					data: {
						price: 20
					}
				};

				var e = emitter(endpoint, 'http', null, method, 0, function (error, body, response) {
					var pd = extractPayload(response, method, true);
					assert.equal(pd['ue_px'], 'eyJzY2hlbWEiOiJpZ2x1OmNvbS5zbm93cGxvd2FuYWx5dGljcy5zbm93cGxvdy91bnN0cnVjdF9ldmVudC9qc29uc2NoZW1hLzEtMC0wIiwiZGF0YSI6eyJzY2hlbWEiOiJpZ2x1OmNvbS5hY21lL3ZpZXdlZF9wcm9kdWN0L2pzb25zY2hlbWEvMS0wLTAiLCJkYXRhIjp7InByaWNlIjoyMH19fQ');
					assert.equal(pd['cx'], 'eyJzY2hlbWEiOiJpZ2x1OmNvbS5zbm93cGxvd2FuYWx5dGljcy5zbm93cGxvdy9jb250ZXh0cy9qc29uc2NoZW1hLzEtMC0wIiwiZGF0YSI6W3sic2NoZW1hIjoiaWdsdTpjb20uYWNtZS91c2VyL2pzb25zY2hlbWEvMS0wLTAiLCJkYXRhIjp7InR5cGUiOiJ0ZXN0ZXIifX1dfQ');
					done.call(this, error);
				});

				var t = tracker(e, 'cf', 'cfe35', true);

				var mock = getMock(method);

				t.trackUnstructEvent(inputJson, context);
			});
		});

		describe('multiple emitters', function () {

			it('should send an event to multiple collectors', function (done) {
				var expected = {
					tv: 'node-' + version,
					tna: 'cf',
					aid: 'cfe35',
					p: 'srv',
					e: 'pv',
					url: 'http://www.example.com',
					page: 'example page',
					refr: 'google'
				};
				var count = 2;

				var e = emitter(endpoint, 'http', null, method, 0, function (error, body, response) {
					checkPayload(extractPayload(response, method), expected);
					count--;
					if (count === 0) {
						done.apply(this, arguments);
					}
				});

				var t = tracker([e, e], 'cf', 'cfe35', false);

				var mocks = [getMock(method), getMock(method)];

				t.trackPageView('http://www.example.com', 'example page', 'google', context);
			});
		});
	});
}

describe('GET', function(){
	performTestsWithMethod('get');
});

describe('POST', function(){
	performTestsWithMethod('post');
});
