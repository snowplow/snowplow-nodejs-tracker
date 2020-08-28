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

import request from 'request';
import http from 'http';
import https from 'https';
import { PayloadDictionary } from 'snowplow-tracker-core';

export interface Emitter {
  flush: () => void;
  input: (payload: PayloadDictionary) => void;
}

/**
 * Create an emitter object which will send events to a collector
 *
 * @param endpoint The collector to which events will be sent
 * @param protocol "http" or "https"
 * @param port The port for requests to use
 * @param method "get" or "post"
 * @param bufferSize Number of events which can be queued before flush is called
 * @param callback Callback passed to the request function
 * @param agentOptions configuration for http.Agent class
 */
export function emitter(
  endpoint: string,
  protocol: string,
  port?: number,
  method?: string,
  bufferSize?: number,
  callback?: request.RequestCallback,
  agentOptions?: http.AgentOptions | https.AgentOptions
): Emitter {
  protocol = (protocol || 'http').toLowerCase();
  method = (method || 'get').toLowerCase();

  const maxBufferLength = bufferSize || (method === 'get' ? 0 : 10);
  const portString = port ? ':' + port : '';
  const path = method === 'get' ? '/i' : '/com.snowplowanalytics.snowplow/tp2';
  const targetUrl = protocol + '://' + endpoint + portString + path;

  let buffer: Array<PayloadDictionary> = [];

  /**
   * Convert all fields in a payload dictionary to strings
   *
   * @param payload Payload on which the new dictionary is based
   */
  const valuesToStrings = (payload: PayloadDictionary): Record<string, string> => {
    const stringifiedPayload: Record<string, string> = {};
    for (const key in payload) {
      if (Object.prototype.hasOwnProperty.call(payload, key)) {
        stringifiedPayload[key] = String(payload[key]);
      }
    }
    return stringifiedPayload;
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

    if (method === 'post') {
      const postJson = {
        schema: 'iglu:com.snowplowanalytics.snowplow/payload_data/jsonschema/1-0-4',
        data: bufferCopy.map(valuesToStrings),
      };
      request.post(
        {
          url: targetUrl,
          json: postJson,
          agentOptions: agentOptions,
          headers: {
            'content-type': 'application/json; charset=utf-8',
          },
        },
        callback
      );
    } else {
      for (let i = 0; i < bufferCopy.length; i++) {
        request.get(
          {
            url: targetUrl,
            agentOptions: agentOptions,
            qs: bufferCopy[i],
          },
          callback
        );
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
