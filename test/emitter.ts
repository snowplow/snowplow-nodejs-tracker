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

import test from 'ava';

import nock from 'nock';
import { emitter } from '../src/index';
import { HttpMethod, HttpProtocol } from '../src/emitter';


const endpoint = 'd3rkrsqld9gmqf.cloudfront.net';

nock('http://' + endpoint, {
  filteringScope: function () {
    return true;
  },
})
  .persist()
  .filteringPath(function () {
    return '/';
  })
  .get('/')
	.reply(200, function (uri) {
    return uri;
  });

nock('http://' + endpoint, {
  filteringScope: function () {
    return true;
  },
})
  .matchHeader('content-type', 'application/json; charset=utf-8')
  .persist()
  .filteringRequestBody(function () {
    return '*';
  })
  .post('/com.snowplowanalytics.snowplow/tp2', '*')
	.reply(200, function (_uri, body: Record<string, unknown>) {
    return (body['data'] as Array<unknown>)[0];
  });

test.before(() => {
  nock.disableNetConnect();
});

test.after(() => {
  nock.cleanAll();
});

test.cb('Emitter should send an HTTP GET request', (t) => {
	const e = emitter(endpoint, HttpProtocol.HTTP, 80, HttpMethod.GET, undefined, function (error, _body, response) {
		t.is(response, '/i?a=b');
		t.end(error);
  });
	e.input({ a: 'b' });
});

test.cb('Emitter should send an HTTP POST request', (t) => {
  const e = emitter(endpoint, HttpProtocol.HTTP, undefined, HttpMethod.POST, 1, function (error, _body, response) {
		t.deepEqual(response, { a: 'b' });
		t.end(error);
  });
  e.input({ a: 'b' });
});

test.cb('should send an HTTPS GET request', (t) => {
  const e = emitter(endpoint, HttpProtocol.HTTPS, 443, HttpMethod.GET, undefined, function (error, _body, response) {
		t.is(response, '/i?a=b');
		t.end(error);
  });
  e.input({ a: 'b' });
});

test.cb('should not send requests if the buffer is not full', (t) => {
  const e = emitter(endpoint, HttpProtocol.HTTPS, undefined, HttpMethod.POST, undefined, () => t.fail('Event unexpectedly emitted'));
  e.input({});
  e.input({});
	e.input({});
	setTimeout(t.end, 250); //Give chance for emitter callback to fire
});

test.cb('should not send requests if the buffer is empty', (t) => {
	const e = emitter(endpoint, HttpProtocol.HTTPS, undefined, HttpMethod.POST, undefined, () => t.fail('Event unexpectedly emitted'));
	e.flush();
	setTimeout(t.end, 250); //Give chance for emitter callback to fire
});
