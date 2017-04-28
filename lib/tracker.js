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

var version = require('./version');
var core = require('snowplow-tracker-core').trackerCore;

/**
 * Snowplow Node.js Tracker
 *
 * @param string or array emitters The emitter or emitters to which events will be sent
 * @param string namespace The namespace of the tracker
 * @param string appId The application ID
 * @param boolean encodeBase64 Whether unstructured events and custom contexts should be base 64 encoded
 */
function tracker(emitters, namespace, appId, encodeBase64) {
	if (!(emitters instanceof Array)) {
		emitters = [emitters];
	}
	encodeBase64 = encodeBase64 !== false;
	var trackerCore = core(encodeBase64, sendPayload);

	trackerCore.setPlatform('srv'); // default platform
	trackerCore.setTrackerVersion('node-' + version);
	trackerCore.setTrackerNamespace(namespace);
	trackerCore.setAppId(appId);

	/**
	 * Send the payload for an event to the endpoint
	 *
	 * @param object payload Dictionary of name-value pairs for the querystring
	 */
	function sendPayload(payload) {
		var builtPayload = payload.build();
		for (var i=0; i<emitters.length; i++) {
			emitters[i].input(builtPayload);
		}
	}

	var trackEcommerceTransaction = trackerCore.trackEcommerceTransaction;

	/**
	 * Track an ecommerce transaction and all items in that transaction
	 * Each item is represented by a dictionary which may have the following fields:
	 * 1. string sku Required. SKU code of the item.
	 * 2. string name Optional. Name of the item.
	 * 3. string category Optional. Category of the item.
	 * 4. string price Required. Price of the item.
	 * 5. string quantity Required. Purchase quantity.
	 * 6. array context Optional. Custom context relating to the item.
	 * 7. number tstamp Optional. Timestamp for the item.
	 *
	 * @param string orderId Required. Internal unique order id number for this transaction.
	 * @param string affiliation Optional. Partner or store affiliation.
	 * @param string total Required. Total amount of the transaction.
	 * @param string tax Optional. Tax amount of the transaction.
	 * @param string shipping Optional. Shipping charge for the transaction.
	 * @param string city Optional. City to associate with transaction.
	 * @param string state Optional. State to associate with transaction.
	 * @param string country Optional. Country to associate with transaction.
	 * @param string currency Optional. Currency to associate with this transaction.
	 * @param array items Optional. Items which make up the transaction.
	 * @param array context Optional. Context relating to the event.
	 * @param number tstamp Optional. Timestamp for the event.
	 */
	trackerCore.trackEcommerceTransaction = function (orderId, affiliation, total, tax, shipping, city, state, country, currency, items, context, tstamp) {
		trackEcommerceTransaction(
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
			for (var i=0; i<items.length; i++) {
				var item = items[i];
				trackerCore.trackEcommerceTransactionItem(
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
	};

	return trackerCore;
}

module.exports = tracker;
