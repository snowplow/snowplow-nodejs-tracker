/*
 * Node.js tracker for Snowplow: got_emitter.ts
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
import { Emitter } from './emitter';

const PROTO_PATH = __dirname + '/../protos/collector.proto';

const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const packageDefinition = protoLoader.loadSync(
    PROTO_PATH,
    {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true
    });
const protoDescriptor = grpc.loadPackageDefinition(packageDefinition);

const CollectorService = protoDescriptor.tracker.CollectorService;
// const TrackerPayloadResponse = protoDescriptor.tracker.TrackPayloadResponse;

/**
 * Create an emitter object, which uses the `@grpc/grpc-js` library, that will send events to a collector
*/
export function grpcEmitter(
  endpoint: string,
  port?: number,
  bufferSize?: number,
  callback?: (error?: Error, response?: any) => void
): Emitter {
  const targetUrl = endpoint + (port ? ':' + port : '');
  const maxBufferLength = bufferSize ?? 10;

  const client = new CollectorService(targetUrl, grpc.credentials.createSsl());

  let buffer: Array<PayloadDictionary> = [];

  const handleSuccess = (response: any) => {
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
  const handleFailure = (error: Error) => {
    if (callback) {
      try {
        callback(error);
      } catch (e) {
        console.error('Error in callback after failure', e);
      }
    }
  };

  const flush = (): void => {
    const bufferCopy = buffer;
    buffer = [];
    if (bufferCopy.length === 0) {
      return;
    }

    const streamingCall = client.streamTrackPayload((err: Error, res: any) => {
      if (err) handleFailure(err);
      console.log(res)
      handleSuccess(res);
    });
    bufferCopy.map((data) =>
      streamingCall.write(data)
    );
    streamingCall.end();
  };

  const input = (payload: PayloadDictionary): void => {
    buffer.push(payload);
    if (buffer.length >= maxBufferLength) {
      flush();
    }
  }

  return {
    /**
     * Send all events queued in the buffer to the collector
     */
    flush,
    input,
  };
}
