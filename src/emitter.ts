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
