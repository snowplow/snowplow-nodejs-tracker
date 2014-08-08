# Node.js Analytics for Snowplow 

[![Build Status][travis-image]][travis]
[![npm version][npm-image]][npm-url]

## Overview

Add analytics to your JavaScript apps, node-webkit projects and node servers with the [Snowplow][snowplow] Node.js Tracker.

This tracker lets you collect server-side event data.

## Find out more

| Technical Docs              | Setup Guide           | Roadmap & Contributing               |         
|-----------------------------|-----------------------|--------------------------------------|
| [ ![i1] [techdocs-image] ] [tech-docs]      | [ ![i2] [setup-image] ] [setup]   | ![i3] [roadmap-image]                |
| [Technical Docs] [tech-docs] | [Setup Guide] [setup] | _coming soon_                        |

## Developers

### Getting started

Make sure you have `node` and `npm` installed and in your `$PATH`.

Install npm dependencies using `npm install`:

```bash
git clone git@github.com:snowplow/snowplow-nodejs-tracker.git
cd snowplow-nodejs-tracker
npm install
```

### Testing

Install mocha globally:

```bash
sudo npm install -g mocha
```

Run the tests:

```bash
mocha tests
```

## Copyright and license

The Snowplow Node.js Tracker is copyright 2014 Snowplow Analytics Ltd.

Licensed under the **[Apache License, Version 2.0] [license]** (the "License");
you may not use this software except in compliance with the License.

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

[snowplow]: http://snowplowanalytics.com

[license]: http://www.apache.org/licenses/LICENSE-2.0

[travis-image]: https://travis-ci.org/snowplow/snowplow-nodejs-tracker.png?branch=master
[travis]: http://travis-ci.org/snowplow/snowplow-nodejs-tracker
[npm-url]: http://badge.fury.io/js/snowplow-nodejs-tracker
[npm-image]: https://badge.fury.io/js/snowplow-nodejs-tracker.svg

[tech-docs]: https://github.com/snowplow/snowplow/wiki/nodejs-tracker
[techdocs-image]: https://d3i6fms1cm1j0i.cloudfront.net/github/images/techdocs.png
[setup]: https://github.com/snowplow/snowplow/wiki/nodejs-tracker-setup
[setup-image]: https://d3i6fms1cm1j0i.cloudfront.net/github/images/setup.png
[roadmap-image]: https://d3i6fms1cm1j0i.cloudfront.net/github/images/roadmap.png
