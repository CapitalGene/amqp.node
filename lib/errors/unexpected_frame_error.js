'use strict';
/**
 * amqp.errors.UnexpectedFrameError
 *
 * @author Chen Liang [code@chen.technology]
 */

/*!
 * Module dependencies.
 */
var inherits = require('util').inherits;

/**
 *  [UnexpectedFrameError description]
 *
 *  @method  UnexpectedFrameError
 *
 *  @param   {Number}              frame              [description]
 *  @param   {Number}              expectedFrameType  [description]
 */
function UnexpectedFrameError(frame, expectedFrameType) {
  Error.call(this);

  this.frame = frame;

  this.expectedFrameType = expectedFrameType;

  this.message = 'Received frame: ' + frame + ', expected type ' + expectedFrameType;
}

inherits(UnexpectedFrameError, Error);

UnexpectedFrameError.prototype.name = 'UnexpectedFrameError';


module.exports = UnexpectedFrameError;
