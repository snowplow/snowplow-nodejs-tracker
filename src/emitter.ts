/*
 * Node.js tracker for Snowplow: emitter.ts
 *
 * Copyright (c) 2014-2020 Snowplow Analytics Ltd. All rights reserved.
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

import { PayloadDictionary } from 'snowplow-tracker-core';

export interface Emitter {
  flush: () => void;
  input: (payload: PayloadDictionary) => void;
}

export enum HttpProtocol {
  HTTP = 'http',
  HTTPS = 'https',
}

export enum HttpMethod {
  GET = 'get',
  POST = 'post',
}

/**
 * Convert all fields in a payload dictionary to strings
 *
 * @param payload Payload on which the new dictionary is based
 */
export const preparePayload = (payload: PayloadDictionary): Record<string, string> => {
  const stringifiedPayload: Record<string, string> = {};

  const finalPayload = addDeviceSentTimestamp(payload);

  for (const key in finalPayload) {
    if (Object.prototype.hasOwnProperty.call(finalPayload, key)) {
      stringifiedPayload[key] = String(finalPayload[key]);
    }
  }
  return stringifiedPayload;
};

/**
 * Adds the 'stm' paramater with the current time to the payload
 * @param payload The payload which will be mutated
 */
const addDeviceSentTimestamp = (payload: PayloadDictionary): PayloadDictionary => {
  payload['stm'] = new Date().getTime().toString();
  return payload;
};
