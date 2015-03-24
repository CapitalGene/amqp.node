'use strict';
/**
 *  AMQP
 *
 *
 *  @author Chen Liang [code@chen.technology]
 */

var rawConnect = require('./connect').connect;
var ChannelModel = require('./channel_model').ChannelModel;
var Promise = require('bluebird');
var debug = require('debug')('amqp');

function connect(url, connOptions, callback) {
  debug('url:', url);
  return rawConnect(url, connOptions)
    .then(function (conn) {
      return new ChannelModel(conn);
    })
    .nodeify(callback);
}

module.exports = {
  connect: connect,
  Connection: require('./connection').Connection,
  Channel: ChannelModel,
  credentials: require('./credentials')
};
