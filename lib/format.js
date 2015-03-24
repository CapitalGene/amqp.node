'use strict';
// Stringifying various things

/*!
 * Module dependencies.
 */
var defs = require('./defs');
var format = require('util').format;
var inherits = require('util').inherits;
var HEARTBEAT = require('./frame').HEARTBEAT;

var closeMessage = function (close) {
  var code = close.fields.replyCode;
  return format('%d (%s) with message "%s"',
    code, defs.constant_strs[code],
    close.fields.replyText);
};

var methodName = function (id) {
  return defs.info(id).name;
};

var inspect = function (frame, showFields) {
  if (frame === HEARTBEAT) {
    return '<Heartbeat>';
  } else if (!frame.id) {
    return format('<Content channel:%d size:%d>',
      frame.channel, frame.size);
  } else {
    var info = defs.info(frame.id);
    return format('<%s channel:%d%s>', info.name, frame.channel, (showFields) ? ' ' + JSON.stringify(frame.fields, undefined, 2) : '');
  }
};


module.exports = {
  closeMessage: closeMessage,
  methodName: methodName,
  inspect: inspect
};
