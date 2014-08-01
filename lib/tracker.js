/*
 * Node.js tracker for Snowplow: tracker.js
 * 
 * Copyright (c) 2014 Snowplow Analytics Ltd. All rights reserved.
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

var core = require('snowplow-tracker-core');
var request = require('request');
var querystring = require('querystring');
var uuid = require('uuid');

function tracker(endpoint, namespace, appId, encodeBase64) {
	var endpoint = 'http://' + endpoint + '/i?';
	var encodeBase64 = encodeBase64 !== false;
	var trackerCore = core(encodeBase64, sendPayload);

	trackerCore.addPayloadDict({
		tna: namespace,
		aid: appId
	})

	function sendPayload(payload) {
		payload['eid'] = uuid.v4();
		console.log(payload);
		request(endpoint + querystring.stringify(payload));
	}


	function setPlatform(value) {
		trackerCore.addPayloadPair('p', value);
		return this;
	}

	function trackEcommerceTransaction(argmap) {
		trackerCore.trackEcommerceTransaction(
			argmap.orderId, 
			argmap.affiliation, 
			argmap.totalValue, 
			argmap.taxValue, 
			argmap.shipping, 
			argmap.city, 
			argmap.state, 
			argmap.country, 
			argmap.currency, 
			argmap.context
		);

		var items = argmap.items;

		if (items) {
			for (var i=0; i<items.length; i++) {
				var item = items[i];
				trackerCore.trackEcommerceTransactionItem(
					argmap.orderId,
					item.sku,
					item.name,
					item.category,
					item.price,
					item.quantity,
					argmap.currency
				);
			}
		}
	}

	return {
		setPlatform: setPlatform,
		trackPageView: trackerCore.trackPageView,
		trackStructEvent: trackerCore.trackStructEvent,
		trackUnstructEvent: trackerCore.trackUnstructEvent,
		trackScreenView: trackerCore.trackScreenView,
		trackEcommerceTransaction: trackEcommerceTransaction,
	};
}
