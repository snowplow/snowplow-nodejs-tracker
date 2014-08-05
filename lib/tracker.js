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

var version = require('./version');
var core = require('snowplow-tracker-core');
var request = require('request');

function tracker(endpoint, namespace, appId, encodeBase64, callback) {
	var endpoint = 'http://' + endpoint + '/i';
	var encodeBase64 = encodeBase64 !== false;
	var trackerCore = core(encodeBase64, sendPayload);

	if (typeof callback !== 'function') callback = function () {};

	trackerCore.addPayloadDict({
		tv: 'node-' + version,
		tna: namespace,
		aid: appId
	});

	function sendPayload(payload) {
		request({url: endpoint, qs: payload}, callback);
	}

	return {

		setPlatform: trackerCore.setPlatform,
		setUserId: trackerCore.setUserId,
		setScreenResolution: trackerCore.setScreenResolution,
		setViewport: trackerCore.setViewport,
		setColorDepth: trackerCore.setColorDepth,
		setTimezone: trackerCore.setTimezone,
		setLang: trackerCore.setLang,
		trackPageView: trackerCore.trackPageView,
		trackStructEvent: trackerCore.trackStructEvent,
		trackUnstructEvent: trackerCore.trackUnstructEvent,
		trackScreenView: trackerCore.trackScreenView,

		trackEcommerceTransaction: function (orderId, affiliation, totalValue, tax, shipping, city, state, country, currency, items, context, tstamp) {
			trackerCore.trackEcommerceTransaction(
				orderId, 
				affiliation, 
				totalValue, 
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
		}
	};
}

module.exports = tracker;
