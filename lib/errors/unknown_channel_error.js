'use strict';
/**
 * amqp.errors.UnknownChannelError
 *
 * @author Chen Liang [code@chen.technology]
 */

/*!
 * Module dependencies.
 */
var inherits = require('util').inherits;

/**
 *  [UnknownChannelError description]
 *
 *  @method  UnknownChannelError
 *
 *  @param   {[type]}             channelNumber  [description]
 */
function UnknownChannelError(channelNumber) {
  Error.call(this);

  this.channelNumber = channelNumber;

  this.message = 'Unknown channel number ' + channelNumber;
}

inherits(UnknownChannelError, Error);

UnknownChannelError.prototype.name = 'UnknownChannelError';


module.exports = UnknownChannelError;
