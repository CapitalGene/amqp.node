'use strict';

var connect = require('../lib/connect').connect;
var assert = require('assert');
var util = require('./util');
var fail = util.fail;
var succeed = util.succeed;
var kCallback = util.kCallback;

var URL = process.env.URL || 'amqp://localhost';

describe('Connect API', function () {

  it('Connection refused', function (done) {
    connect('amqp://localhost:23450', {},
      kCallback(fail(done), succeed(done)));
  });

  // %% this ought to fail the promise, rather than throwing an error
  it('bad URL', function () {
    assert.throws(function () {
      connect('blurble');
    });
  });

  it('wrongly typed open option', function (done) {
    var url = require('url');
    var parts = url.parse(URL, true);
    var q = parts.query || {};
    q.frameMax = 'NOT A NUMBER';
    parts.query = q;
    var u = url.format(parts);
    connect(u, {}, kCallback(fail(done), succeed(done)));
  });

  it('using plain credentials', function (done) {
    var url = require('url');
    var parts = url.parse(URL, true);
    var u = 'guest',
      p = 'guest';
    if (parts.auth) {
      var auth = parts.auth.split(':');
      var u = auth[0];
      var p = auth[1];
    }
    connect(URL, {
        credentials: require('../lib/credentials').plain(u, p)
      },
      kCallback(succeed(done), fail(done)));
  });

  it('using unsupported mechanism', function (done) {
    var creds = {
      mechanism: 'UNSUPPORTED',
      response: function () {
        return new Buffer('');
      }
    };
    connect(URL, {
        credentials: creds
      },
      kCallback(fail(done), succeed(done)));
  });
});
