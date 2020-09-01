/*
 * Node.js tracker for Snowplow: tracker.js
 *
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

import { version } from './version';
import { trackerCore, PayloadData, SelfDescribingJson, Timestamp, Core } from 'snowplow-tracker-core';
import { Emitter } from './emitter';

export interface EcommerceTransactionItem {
  sku: string;
  name: string;
  category: string;
  price: string;
  quantity: string;
  context?: Array<SelfDescribingJson>;
}

export interface Tracker extends Core {
  /**
   * Track an ecommerce transaction and all items in that transaction
   * Each item is represented by an EcommerceTransactionItem interface.
   *
   * @param orderId Internal unique order id number for this transaction.
   * @param affiliation Partner or store affiliation.
   * @param total Total amount of the transaction.
   * @param tax Tax amount of the transaction.
   * @param shipping Shipping charge for the transaction.
   * @param city City to associate with transaction.
   * @param state State to associate with transaction.
   * @param country Country to associate with transaction.
   * @param currency Currency to associate with this transaction.
   * @param items Items which make up the transaction.
   * @param context Context relating to the event.
   * @param tstamp Timestamp for the event.
   */
  trackEcommerceTransactionWithItems: (
    orderId: string,
    affiliation: string,
    total: string,
    tax?: string,
    shipping?: string,
    city?: string,
    state?: string,
    country?: string,
    currency?: string,
    items?: Array<EcommerceTransactionItem>,
    context?: Array<SelfDescribingJson>,
    tstamp?: Timestamp
  ) => PayloadData;

  /**
   * Set the domain user ID
   *
   * @param userId The domain user id
   */
  setDomainUserId: (userId: string) => void;

  /**
   * Set the network user ID
   *
   * @param userId The network user id
   */
  setNetworkUserId: (userId: string) => void;
}

/**
 * Snowplow Node.js Tracker
 *
 * @param string or array emitters The emitter or emitters to which events will be sent
 * @param string namespace The namespace of the tracker
 * @param string appId The application ID
 * @param boolean encodeBase64 Whether unstructured events and custom contexts should be base 64 encoded
 */
export function tracker(
  emitters: Emitter | Array<Emitter>,
  namespace: string,
  appId: string,
  encodeBase64: boolean
): Tracker {
  let domainUserId: string;
  let networkUserId: string;
  let allEmitters: Array<Emitter>;

  if (emitters instanceof Array) {
    allEmitters = emitters;
  } else {
    allEmitters = [emitters];
  }

  encodeBase64 = encodeBase64 !== false;

  const addUserInformation = (payload: PayloadData): void => {
    payload.add('duid', domainUserId);
    payload.add('nuid', networkUserId);
  };

  /**
   * Send the payload for an event to the endpoint
   *
   * @param payload Dictionary of name-value pairs for the querystring
   */
  const sendPayload = (payload: PayloadData): void => {
    addUserInformation(payload);
    const builtPayload = payload.build();
    for (let i = 0; i < allEmitters.length; i++) {
      allEmitters[i].input(builtPayload);
    }
  };

  const core = trackerCore(encodeBase64, sendPayload);

  core.setPlatform('srv'); // default platform
  core.setTrackerVersion('node-' + version);
  core.setTrackerNamespace(namespace);
  core.setAppId(appId);

  const trackEcommerceTransactionWithItems = function (
    orderId: string,
    affiliation: string,
    total: string,
    tax?: string,
    shipping?: string,
    city?: string,
    state?: string,
    country?: string,
    currency?: string,
    items?: Array<EcommerceTransactionItem>,
    context?: Array<SelfDescribingJson>,
    tstamp?: Timestamp
  ): PayloadData {
    const payloadData = core.trackEcommerceTransaction(
      orderId,
      affiliation,
      total,
      tax,
      shipping,
      city,
      state,
      country,
      currency,
      context,
      tstamp
    );

    if (items) {
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        core.trackEcommerceTransactionItem(
          orderId,
          item.sku,
          item.name,
          item.category,
          item.price,
          item.quantity,
          currency,
          item.context,
          tstamp
        );
      }
    }

    return payloadData;
  };

  const setDomainUserId = function (userId: string) {
    domainUserId = userId;
  }

  const setNetworkUserId = function (userId: string) {
    networkUserId = userId;
  }

  return {
    trackEcommerceTransactionWithItems,
    setDomainUserId,
    setNetworkUserId,
    ...core,
  };
}
