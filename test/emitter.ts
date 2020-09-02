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

import { preparePayload } from '../src/emitter';
import { PayloadDictionary } from 'snowplow-tracker-core';

test('preparePayload should convert payload values to strings', (t) => {
  const payload: PayloadDictionary = { a: 1234, b: '1'}

  const result = preparePayload(payload);

  t.like(result, { a: '1234', b: '1' });
});

test('preparePayload should add "stm" property', (t) => {
  const testTime = new Date('2020-06-15T09:12:30.000Z').getTime();
  const clock = sinon.useFakeTimers(testTime);
  
  const payload: PayloadDictionary = { a: '1'}

  const result = preparePayload(payload);

  t.deepEqual(result, { a: '1', stm: testTime.toString()});

  clock.restore();
});