'use strict';
/**
 * test.root.js
 *
 * root test for mocha
 */
/* global chai*/

global.chai = require('chai');
global.should = chai.should();
global.expect = chai.expect;
// global.fixtures = require('./fixtures');
chai.use(require('chai-as-promised'));

