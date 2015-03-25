'use strict';
/**
 * amqp.errors.ShutdownSignalError
 *
 * @author Chen Liang [code@chen.technology]
 */

/*!
 * Module dependencies.
 */
var inherits = require('util').inherits;

/**
 *  [ShutdownSignalError description]
 *
 *  @method  ShutdownSignalError
 *
 *  @param   {[type]}             reason                  [description]
 *  @param   {[type]}             hardError               [description]
 *  @param   {[type]}             initiatedByApplication  [description]
 *  @param   {[type]}             ref                     [description]
 *  @param   {Error}             cause                   [description]
 */
function ShutdownSignalError(hardError, initiatedByApplication, reason, ref, cause) {
  Error.call(this);
  /**
   *  True if the connection is shut down, or false if this signal refers to a channel
   *  @type  {Boolean}
   */
  this.hardError = hardError;
  /**
   *  True if this exception is caused by explicit application action;
   *  false if it originated with the broker or as a result of detectable
   *  non-deliberate application failure
   *  @type  {Boolean}
   */
  this.initiatedByApplication = initiatedByApplication;
  /**
   *  Possible explanation
   *  @type  {String}
   */
  this.reason = reason;
  /**
   *  Either Channel or Connection instance, depending on _hardError
   *  @type  {[type]}
   */
  this.ref = ref;

  this.cause = cause;

  this.error = this.composeMessage(hardError,
    initiatedByApplication, reason, cause);
}

inherits(ShutdownSignalError, Error);

ShutdownSignalError.prototype.name = 'ShutdownSignalError';

ShutdownSignalError.prototype.composeMessage = function (hardError,
  initiatedByApplication, reason, messagePrefix, cause) {
  var connectionOrChannel = hardError ? 'connection' : 'channel';
  var appInitiated = 'clean ' + connectionOrChannel + ' shutdown';
  var nonAppInitiated = connectionOrChannel + ' error';
  var explanation = initiatedByApplication ? appInitiated : nonAppInitiated;
  var result = explanation;
  if (reason) {
    result += ('; protocol method: ') + reason;
  }
  if (cause) {
    result += ('; cause: ') + cause;
  }
  return result.toString();
};

module.exports = ShutdownSignalError;
