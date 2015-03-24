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

function connect(url, connOptions) {
  debug('url:', url);
  return new Promise(function (resolve, reject) {
    rawConnect(url, connOptions, function (err, conn) {
      if (err === null) {
        resolve(new ChannelModel(conn));
      } else {
        reject(err);
      }
    });
  });
}

module.exports = {
  connect: connect,
  Channel: ChannelModel,
  credentials: require('./credentials')
};
