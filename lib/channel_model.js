'use strict';
/*!
 * Module dependencies.
 */
var Promise = require('bluebird');
var defs = require('./defs');
var inherits = require('util').inherits;
var EventEmitter = require('events').EventEmitter;
var BaseChannel = require('./channel').BaseChannel;
var acceptMessage = require('./channel').acceptMessage;
var Args = require('./api_args');
var debug = require('debug')('amqp:ChannelModel');
var inspect = require('util').inspect;

function ChannelModel(connection) {
  EventEmitter.call(this);
  if (!(this instanceof ChannelModel)) {
    return new ChannelModel(connection);
  }
  this.connection = connection;
  var self = this;
  ['error', 'close', 'blocked', 'unblocked'].forEach(function(ev) {
    connection.on(ev, self.emit.bind(self, ev));
  });
}
inherits(ChannelModel, EventEmitter);


ChannelModel.prototype.close = function(callback) {
  var self = this;
  return new Promise(function(resolve, reject) {
    self.connection.close(function(err) {
      if (err) {
        return reject(err);
      }
      resolve();
    });
  }).nodeify(callback);
};

// Channels

function Channel(connection) {
  BaseChannel.call(this, connection);
  this.on('delivery', this.handleDelivery.bind(this));
  this.on('cancel', this.handleCancel.bind(this));
}
inherits(Channel, BaseChannel);



ChannelModel.prototype.createChannel = function(callback) {
  debug('createChannel');
  var self = this;
  var c = new Channel(self.connection);
  return c.open()
    .then(function(openOk) {
      debug('createChannel openOk');
      return c;
    }).nodeify(callback);
};

// An RPC that returns a 'proper' promise, which resolves to just the
// response's fields; this is intended to be suitable for implementing
// API procedures.
Channel.prototype.rpc = function(method, fields, expect, callback) {
  debug('rpc:', method);
  var self = this;
  return new Promise(function(resolve, reject) {
    self._rpc(method, fields, expect, function(err, f) {
      if (err) {
        return reject(err);
      }
      resolve(f.fields);
    });
  }).nodeify(callback);
};

// Do the remarkably simple channel open handshake
Channel.prototype.open = function(callback) {
  return Promise.try(this.allocate.bind(this))
    .then(function(ch) {
      return ch.rpc(defs.ChannelOpen, {
        outOfBand: ''
      }, defs.ChannelOpenOk);
    }).nodeify(callback);
};

Channel.prototype.close = function(callback) {
  var self = this;
  return new Promise(function(resolve) {
    self.closeBecause('Goodbye', defs.constants.REPLY_SUCCESS,
      resolve);
  }).nodeify(callback);
};

// === Public API, declaring queues and stuff ===

Channel.prototype.assertQueue = function(queue, options, callback) {
  return this.rpc(
    defs.QueueDeclare,
    Args.assertQueue(queue, options),
    defs.QueueDeclareOk,
    callback
  );
};

Channel.prototype.checkQueue = function(queue, callback) {
  return this.rpc(
    defs.QueueDeclare,
    Args.checkQueue(queue),
    defs.QueueDeclareOk,
    callback
  );
};

Channel.prototype.deleteQueue = function(queue, options, callback) {
  return this.rpc(
    defs.QueueDelete,
    Args.deleteQueue(queue, options),
    defs.QueueDeleteOk,
    callback
  );
};

Channel.prototype.purgeQueue = function(queue, callback) {
  return this.rpc(
    defs.QueuePurge,
    Args.purgeQueue(queue),
    defs.QueuePurgeOk,
    callback
  );
};

Channel.prototype.bindQueue = function(queue, source, pattern, argt, callback) {
  return this.rpc(
    defs.QueueBind,
    Args.bindQueue(queue, source, pattern, argt),
    defs.QueueBindOk,
    callback
  );
};

Channel.prototype.unbindQueue = function(queue, source, pattern, argt, callback) {
  return this.rpc(
    defs.QueueUnbind,
    Args.unbindQueue(queue, source, pattern, argt),
    defs.QueueUnbindOk,
    callback
  );
};

Channel.prototype.assertExchange = function(exchange, type, options, callback) {
  debug('assertExchange');
  // The server reply is an empty set of fields, but it's convenient
  // to have the exchange name handed to the continuation.
  return this.rpc(defs.ExchangeDeclare,
    Args.assertExchange(exchange, type, options),
    defs.ExchangeDeclareOk)
    .then(function(_ok) {
      return {
        exchange: exchange
      };
    }).nodeify(callback);
};

Channel.prototype.checkExchange = function(exchange, callback) {
  return this.rpc(
    defs.ExchangeDeclare,
    Args.checkExchange(exchange),
    defs.ExchangeDeclareOk,
    callback
  );
};

Channel.prototype.deleteExchange = function(name, options, callback) {
  return this.rpc(
    defs.ExchangeDelete,
    Args.deleteExchange(name, options),
    defs.ExchangeDeleteOk,
    callback
  );
};

Channel.prototype.bindExchange = function(dest, source, pattern, argt, callback) {
  return this.rpc(defs.ExchangeBind,
    Args.bindExchange(dest, source, pattern, argt),
    defs.ExchangeBindOk,
    callback);
};

Channel.prototype.unbindExchange = function(dest, source, pattern, argt, callback) {
  return this.rpc(
    defs.ExchangeUnbind,
    Args.unbindExchange(dest, source, pattern, argt),
    defs.ExchangeUnbindOk,
    callback
  );
};

// Working with messages

Channel.prototype.publish = function(exchange, routingKey, content, options, callback) {
  var fieldsAndProps = Args.publish(exchange, routingKey, options);
  return this.sendMessage(fieldsAndProps, fieldsAndProps, content, callback);
};

Channel.prototype.sendToQueue = function(queue, content, options, callback) {
  return this.publish('', queue, content, options, callback);
};

Channel.prototype.consume = function(queue, consumerCallback, options, callback) {
  var self = this;
  // NB we want the callback to be run synchronously, so that we've
  // registered the consumerTag before any messages can arrive.
  var fields = Args.consume(queue, options);
  return new Promise(function(resolve, reject) {
    self._rpc(defs.BasicConsume, fields, defs.BasicConsumeOk,
      function(err, ok) {
        if (err === null) {
          self.registerConsumer(ok.fields.consumerTag,
            consumerCallback);
          resolve(ok.fields);
        } else {
          reject(err);
        }
      });
  }).nodeify(callback);

};

Channel.prototype.cancel = function(consumerTag, callback) {
  var self = this;
  return new Promise(function(resolve, reject) {
    self._rpc(defs.BasicCancel, Args.cancel(consumerTag),
      defs.BasicCancelOk,
      function(err, ok) {
        if (err === null) {
          self.unregisterConsumer(consumerTag);
          resolve(ok.fields);
        } else {
          reject(err);
        }
      });
  }).nodeify(callback);

};

Channel.prototype.get = function(queue, options, callback) {

  var self = this;
  var fields = Args.get(queue, options);
  return new Promise(function(resolve, reject) {
    self.sendOrEnqueue(defs.BasicGet, fields, function(err, f) {
      if (err === null) {
        if (f.id === defs.BasicGetEmpty) {
          resolve(false);
        } else if (f.id === defs.BasicGetOk) {
          var fields = f.fields;
          self.handleMessage = acceptMessage(function(m) {
            m.fields = fields;
            resolve(m);
          });
        } else {
          reject(new Error('Unexpected response to BasicGet: ' +
            inspect(f)));
        }
      } else {
        reject(err);
      }
    });
  }).nodeify(callback);

};

Channel.prototype.ack = function(message, allUpTo) {
  this.sendImmediately(
    defs.BasicAck,
    Args.ack(message.fields.deliveryTag, allUpTo));
};

Channel.prototype.ackAll = function() {
  this.sendImmediately(defs.BasicAck, Args.ack(0, true));
};

Channel.prototype.nack = function(message, allUpTo, requeue) {
  this.sendImmediately(
    defs.BasicNack,
    Args.nack(message.fields.deliveryTag, allUpTo, requeue));
};

Channel.prototype.nackAll = function(requeue) {
  this.sendImmediately(defs.BasicNack,
    Args.nack(0, true, requeue));
};

// `Basic.Nack` is not available in older RabbitMQ versions (or in the
// AMQP specification), so you have to use the one-at-a-time
// `Basic.Reject`. This is otherwise synonymous with
// `#nack(message, false, requeue)`.
Channel.prototype.reject = function(message, requeue) {
  this.sendImmediately(
    defs.BasicReject,
    Args.reject(message.fields.deliveryTag, requeue));
};

// There are more options in AMQP than exposed here; RabbitMQ only
// implements prefetch based on message count, and only for individual
// channels or consumers. RabbitMQ v3.3.0 and after treat prefetch
// (without `global` set) as per-consumer (for consumers following),
// and prefetch with `global` set as per-channel.
Channel.prototype.prefetch = Channel.prototype.qos = function(count, global, callback) {
  return this.rpc(
    defs.BasicQos,
    Args.prefetch(count, global),
    defs.BasicQosOk,
    callback
  );
};

Channel.prototype.recover = function(callback) {
  return this.rpc(
    defs.BasicRecover,
    Args.recover(),
    defs.BasicRecoverOk,
    callback
  );
};

// Confirm channel. This is a channel with confirms 'switched on',
// meaning sent messages will provoke a responding 'ack' or 'nack'
// from the server. The upshot of this is that `publish` and
// `sendToQueue` both take a callback, which will be called either
// with `null` as its argument to signify 'ack', or an exception as
// its argument to signify 'nack'.

function ConfirmChannel(connection) {
  Channel.call(this, connection);
}
inherits(ConfirmChannel, Channel);



ChannelModel.prototype.createConfirmChannel = function(callback) {
  var c = new ConfirmChannel(this.connection);
  return c.open()
    .then(function(openOk) {
      return c.rpc(
        defs.ConfirmSelect, {
          nowait: false
        },
        defs.ConfirmSelectOk);
    })
    .then(function() {
      return c;
    })
    .nodeify(callback);
};


ConfirmChannel.prototype.publish = function(exchange, routingKey, content, options, cb) {
  this.pushConfirmCallback(cb);
  return Channel.prototype.publish.call(this, exchange, routingKey, content, options, cb);
};

ConfirmChannel.prototype.sendToQueue = function(queue, content, options, cb) {
  return this.publish('', queue, content, options, cb);
};


/**
 * An experimental waitForConfirms. This one works by replacing each
 * callback in the unconfirmed messages window with a promise-resolver,
 * and returning a promise that resolves when all of those do.
 *
 * @return {[type]} [description]
 */
ConfirmChannel.prototype.waitForConfirms = function(callback) {
  var await = [];
  var unconfirmed = this.unconfirmed;
  unconfirmed.forEach(function(val, index) {
    if (!val) {
      return;
    }
    var confirmed = new Promise(function(resolve, reject) {
      unconfirmed[index] = function(err) {
        if (val) {
          val(err);
        }
        if (err) {
          return reject(err);
        }
        return resolve();
      };
    });
    await.push(confirmed);

  });
  return Promise.all(await)
    .nodeify(callback);
};

module.exports = {
  ChannelModel: ChannelModel,
  Channel: Channel,
  ConfirmChannel: ConfirmChannel
};
