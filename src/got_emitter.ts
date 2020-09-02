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

import got, { Response, RequestError, Agents, RequiredRetryOptions, ToughCookieJar, PromiseCookieJar } from 'got';
import { PayloadDictionary } from 'snowplow-tracker-core';

import { Emitter, HttpProtocol, HttpMethod, preparePayload } from './emitter';
import { version } from './version';

/**
 * Create an emitter object, which uses the `got` library, that will send events to a collector
 *
 * @param endpoint The collector to which events will be sent
 * @param protocol http or https
 * @param port The port for requests to use
 * @param method get or post
 * @param bufferSize Number of events which can be queued before flush is called
 * @param retry Configure the retry policy for `got` - https://github.com/sindresorhus/got/blob/v11.5.2/readme.md#retry
 * @param cookieJar Add a cookieJar to `got` - https://github.com/sindresorhus/got/blob/v11.5.2/readme.md#cookiejar
 * @param callback Callback called after a `got` request following retries - called with ErrorRequest (https://github.com/sindresorhus/got/blob/v11.5.2/readme.md#errors) and Response (https://github.com/sindresorhus/got/blob/v11.5.2/readme.md#response)
 * @param agents Set new http.Agent and https.Agent objects on `got` requests - https://github.com/sindresorhus/got/blob/v11.5.2/readme.md#agent
 */
export function gotEmitter(
  endpoint: string,
  protocol: HttpProtocol,
  port?: number,
  method?: HttpMethod,
  bufferSize?: number,
  retry?: number | Partial<RequiredRetryOptions>,
  cookieJar?: PromiseCookieJar | ToughCookieJar,
  callback?: (error?: RequestError, response?: Response<string>) => void,
  agents?: Agents
): Emitter {
  const maxBufferLength = bufferSize ?? (method === HttpMethod.GET ? 0 : 10);
  const path = method === HttpMethod.GET ? '/i' : '/com.snowplowanalytics.snowplow/tp2';
  const targetUrl = protocol + '://' + endpoint + (port ? ':' + port : '') + path;

  let buffer: Array<PayloadDictionary> = [];

  /**
   * Handles the callback on a successful response if the callback is present
   * @param response The got response object
   */
  const handleSuccess = (response: Response<string>) => {
    if (callback) {
      try {
        callback(undefined, response);
      } catch (e) {
        console.error('Error in callback after success', e);
      }
    }
  };

  /**
   * Handles the callback on a failed request if the callback is present
   * @param error The got error object
   */
  const handleFailure = (error: RequestError) => {
    if (callback) {
      try {
        callback(error);
      } catch (e) {
        console.error('Error in callback after failure', e);
      }
    }
  };

  /**
   * Flushes all events currently stored in buffer
   */
  const flush = (): void => {
    const bufferCopy = buffer;
    buffer = [];
    if (bufferCopy.length === 0) {
      return;
    }

    if (method === HttpMethod.POST) {
      const postJson = {
        schema: 'iglu:com.snowplowanalytics.snowplow/payload_data/jsonschema/1-0-4',
        data: bufferCopy.map(preparePayload),
      };
      got
        .post(targetUrl, {
          json: postJson,
          headers: {
            'content-type': 'application/json; charset=utf-8',
            'user-agent': `snowplow-nodejs-tracker/${version}`,
          },
          agent: agents,
          retry: retry,
          cookieJar: cookieJar,
        })
        .then(handleSuccess, handleFailure);
    } else {
      for (let i = 0; i < bufferCopy.length; i++) {
        got
          .get(targetUrl, {
            searchParams: preparePayload(bufferCopy[i]),
            headers: {
              'user-agent': `snowplow-nodejs-tracker/${version}`,
            },
            agent: agents,
            retry: retry,
            cookieJar: cookieJar,
          })
          .then(handleSuccess, handleFailure);
      }
    }
  };

  /**
   * Adds a payload to the internal buffer and sends if buffer >= bufferSize
   * @param payload Payload to add to buffer
   */
  const input = (payload: PayloadDictionary): void => {
    buffer.push(payload);
    if (buffer.length >= maxBufferLength) {
      flush();
    }
  };

  return {
    /**
     * Send all events queued in the buffer to the collector
     */
    flush,
    input,
  };
}
