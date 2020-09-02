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
import sinon from 'sinon';
import nock from 'nock';
import { HttpMethod, HttpProtocol, gotEmitter } from '../src/index';

const endpoint = 'd3rkrsqld9gmqf.cloudfront.net';

nock(new RegExp('https*://' + endpoint))
  .persist()
  .filteringPath(() => '/')
  .get('/')
  .reply(200, (uri) => uri);

nock(new RegExp('https*://' + endpoint))
  .matchHeader('content-type', 'application/json; charset=utf-8')
  .persist()
  .filteringRequestBody(() => '*')
  .post('/com.snowplowanalytics.snowplow/tp2', '*')
  .reply(200, (_uri, body: Record<string, unknown>) => (body['data'] as Array<unknown>)[0]);

test.before(() => {
  nock.disableNetConnect();
});

test.after(() => {
  nock.cleanAll();
});

test.cb('gotEmitter should send an HTTP GET request', (t) => {
  const e = gotEmitter(endpoint, HttpProtocol.HTTP, 80, HttpMethod.GET, undefined, undefined, undefined, function (
    error,
    response
  ) {
    t.regex(response?.body as string, /\/i\?.*a=b.*/);
    t.end(error);
  });
  e.input({ a: 'b' });
});

test.cb('gotEmitter should send an HTTP POST request', (t) => {
  const e = gotEmitter(endpoint, HttpProtocol.HTTP, undefined, HttpMethod.POST, 1, undefined, undefined, function (
    error,
    response
  ) {
    t.like(JSON.parse(response?.body as string), { a: 'b' });
    t.end(error);
  });
  e.input({ a: 'b' });
});

test.cb('gotEmitter should send an HTTPS GET request', (t) => {
  const e = gotEmitter(endpoint, HttpProtocol.HTTPS, 443, HttpMethod.GET, undefined, undefined, undefined, function (
    error,
    response
  ) {
    t.regex(response?.body as string, /\/i\?.*a=b.*/);
    t.end(error);
  });
  e.input({ a: 'b' });
});

test.cb('gotEmitter should send an HTTPS POST request', (t) => {
  const e = gotEmitter(endpoint, HttpProtocol.HTTPS, undefined, HttpMethod.POST, 1, undefined, undefined, function (
    error,
    response
  ) {
    t.like(JSON.parse(response?.body as string), { a: 'b' });
    t.end(error);
  });
  e.input({ a: 'b' });
});

test.cb('gotEmitter should not send requests if the buffer is not full', (t) => {
  const e = gotEmitter(endpoint, HttpProtocol.HTTPS, undefined, HttpMethod.POST, undefined, undefined, undefined, () =>
    t.fail('Event unexpectedly emitted')
  );
  e.input({});
  e.input({});
  e.input({});
  setTimeout(t.end, 250); //Give chance for emitter callback to fire
});

test.cb('gotEmitter should not send requests if the buffer is empty', (t) => {
  const e = gotEmitter(endpoint, HttpProtocol.HTTPS, undefined, HttpMethod.POST, undefined, undefined, undefined, () =>
    t.fail('Event unexpectedly emitted')
  );
  e.flush();
  setTimeout(t.end, 250); //Give chance for emitter callback to fire
});

test.cb('gotEmitter should add STM querystring parameter when sending POST requests', (t) => {
  const testTime = new Date('1988-12-12T12:30:00.000Z').getTime();
  const clock = sinon.useFakeTimers(testTime);

  const e = gotEmitter(endpoint, HttpProtocol.HTTP, undefined, HttpMethod.POST, 1, undefined, undefined, function (
    error,
    response
  ) {
    t.like(JSON.parse(response?.body as string), { stm: testTime.toString() });
    t.end(error);
  });
  e.input({ a: 'b' });

  clock.restore();
});

test.cb('gotEmitter should add STM querystring parameter when sending GET requests', (t) => {
  const testTime = new Date('2020-06-15T09:12:30.000Z').getTime();
  const clock = sinon.useFakeTimers(testTime);

  const e = gotEmitter(endpoint, HttpProtocol.HTTPS, 443, HttpMethod.GET, undefined, undefined, undefined, function (
    error,
    response
  ) {
    t.regex(response?.body as string, new RegExp(`/i?.*stm=${testTime}.*`));
    t.end(error);
  });
  e.input({ a: 'b' });

  clock.restore();
});

test.cb('gotEmitter should handle undefined callbacks on success situation', (t) => {
  t.notThrows(() => {
    const e = gotEmitter(endpoint, HttpProtocol.HTTPS, 443, HttpMethod.GET, undefined, undefined, undefined, undefined);
    e.input({ a: 'b' });
  });
  t.end();
});

test.cb('gotEmitter should handle undefined callbacks on failure situation', (t) => {
  t.notThrows(() => {
    const e = gotEmitter('invalid-url', HttpProtocol.HTTPS, 443, HttpMethod.POST, 1, undefined, undefined, undefined);
    e.input({ a: 'b' });
  });
  t.end();
});

test.cb('gotEmitter should catch error in success situation', (t) => {
  t.notThrows(() => {
    const e = gotEmitter(
      endpoint,
      HttpProtocol.HTTPS,
      443,
      HttpMethod.GET,
      undefined,
      undefined,
      undefined,
      function () {
        throw new Error('test error');
      }
    );
    e.input({ a: 'b' });
  });
  t.end();
});

test.cb('gotEmitter should catch error in error situation', (t) => {
  t.notThrows(() => {
    const e = gotEmitter('invalid-url', HttpProtocol.HTTPS, 443, HttpMethod.POST, 1, undefined, undefined, function () {
      throw new Error('test error');
    });
    e.input({ a: 'b' });
  });
  t.end();
});

test.cb('gotEmitter should pass response in success situation', (t) => {
  const e = gotEmitter(endpoint, HttpProtocol.HTTPS, 443, HttpMethod.GET, undefined, undefined, undefined, function (
    error,
    response
  ) {
    t.falsy(error);
    t.truthy(response);
    t.end();
  });
  e.input({ a: 'b' });
});

test.cb('gotEmitter should pass error in error situation', (t) => {
  const e = gotEmitter('invalid-url', HttpProtocol.HTTPS, 443, HttpMethod.POST, 1, undefined, undefined, function (
    error,
    response
  ) {
    t.truthy(error);
    t.falsy(response);
    t.end();
  });
  e.input({ a: 'b' });
});
