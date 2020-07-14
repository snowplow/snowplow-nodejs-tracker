# Node.js Analytics for Snowplow

[![early-release]][tracker-classificiation]
[![Build Status][travis-image]][travis]
[![npm version][npm-image]][npm-url]
[![Coveralls][coveralls-image]][coveralls]

## Overview

Add analytics to your JavaScript apps, node-webkit projects and Node.js servers with the [Snowplow][snowplow] Node.js Tracker.

This tracker lets you collect event data from Node.js applications.

## Find out more

| Technical Docs                       | Setup Guide                   | Roadmap & Contributing  |
|--------------------------------------|-------------------------------|-------------------------|
| [![i1][techdocs-image]][tech-docs] | [![i2][setup-image]][setup] | ![i3][roadmap-image]    |
| [Technical Docs][tech-docs]          | [Setup Guide][setup]          | _coming soon_           |

## Developers

### Getting started

Make sure you have `node` and `npm` installed and in your `$PATH`.

Install npm dependencies using `npm install`:

```bash
git clone git@github.com:snowplow/snowplow-nodejs-tracker.git
cd snowplow-nodejs-tracker
npm install
npm test
```

## Copyright and license

The Snowplow Node.js Tracker is copyright 2014-2017 Snowplow Analytics Ltd.

Licensed under the **[Apache License, Version 2.0][license]** (the "License");
you may not use this software except in compliance with the License.

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

[snowplow]: http://snowplowanalytics.com

[license]: http://www.apache.org/licenses/LICENSE-2.0

[travis-image]: https://travis-ci.org/snowplow/snowplow-nodejs-tracker.png?branch=master
[travis]: https://travis-ci.org/snowplow/snowplow-nodejs-tracker
[npm-url]: https://badge.fury.io/js/snowplow-tracker
[npm-image]: https://badge.fury.io/js/snowplow-tracker.svg
[coveralls-image]: https://coveralls.io/repos/snowplow/snowplow-nodejs-tracker/badge.png?branch=master
[coveralls]: https://coveralls.io/r/snowplow/snowplow-nodejs-tracker?branch=master

[tech-docs]: https://github.com/snowplow/snowplow/wiki/node.js-tracker
[techdocs-image]: https://d3i6fms1cm1j0i.cloudfront.net/github/images/techdocs.png
[setup]: https://github.com/snowplow/snowplow/wiki/node.js-tracker-setup
[setup-image]: https://d3i6fms1cm1j0i.cloudfront.net/github/images/setup.png
[roadmap-image]: https://d3i6fms1cm1j0i.cloudfront.net/github/images/roadmap.png

[tracker-classificiation]: https://github.com/snowplow/snowplow/wiki/Tracker-Maintenance-Classification
[early-release]: https://img.shields.io/static/v1?style=flat&label=Snowplow&message=Early%20Release&color=014477&labelColor=9ba0aa&logo=data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAeFBMVEVMaXGXANeYANeXANZbAJmXANeUANSQAM+XANeMAMpaAJhZAJeZANiXANaXANaOAM2WANVnAKWXANZ9ALtmAKVaAJmXANZaAJlXAJZdAJxaAJlZAJdbAJlbAJmQAM+UANKZANhhAJ+EAL+BAL9oAKZnAKVjAKF1ALNBd8J1AAAAKHRSTlMAa1hWXyteBTQJIEwRgUh2JjJon21wcBgNfmc+JlOBQjwezWF2l5dXzkW3/wAAAHpJREFUeNokhQOCA1EAxTL85hi7dXv/E5YPCYBq5DeN4pcqV1XbtW/xTVMIMAZE0cBHEaZhBmIQwCFofeprPUHqjmD/+7peztd62dWQRkvrQayXkn01f/gWp2CrxfjY7rcZ5V7DEMDQgmEozFpZqLUYDsNwOqbnMLwPAJEwCopZxKttAAAAAElFTkSuQmCC 
