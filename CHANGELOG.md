# Change log for amqplib

## v0.3.3 (2016-09-19)
* **deps**: amqp-node-defs@0.0.2

## v0.3.2 (2016-09-19)
* renamed to amqp-node
* [94fb96db] bluebird@3
* [1318ff43] fixed bluebird errors
* [de440471] **lib/channel**: fixed throw non-Error

## Changes in v0.3.1 (since v0.3.0)

   git log v0.3.0..v0.3.1

### Fixes

 * Fail in the right way when a channel cannot be allocated [issue
 129](https://github.com/squaremo/amqp.node/issues/129)
 * Make `waitForConfirms` work properly in callback API [PR
   116](https://github.com/squaremo/amqp.node/pull/116)

### Enhancements

 * Two new options while connecting:
   [timeout](https://github.com/squaremo/amqp.node/pull/118) and [keep
   alive](https://github.com/squaremo/amqp.node/pull/125) (thanks to
   @rexxars and @jcrugzz respectively)

## Changes in v0.3.0 (since v0.2.1)

   git log v0.2.1..v0.3.0

### Enhancements

 * Allow additional client properties to be set for a connection
   [Issue 98](https://github.com/squaremo/amqp.node/issues/98) and
   [PR 80](https://github.com/squaremo/amqp.node/pull/80)
 * New method in channel API to wait for all unconfirmed messages
   [Issue 89](https://github.com/squaremo/amqp.node/issues/89)
 * Now supports RabbitMQ's `EXTERNAL` authentication plugin
   [Issue 105](https://github.com/squaremo/amqp.node/issues/105)

## Changes in v0.2.1 (since v0.2.0)

### Fixes

 * Do tuning negotation properly [PR
   84](https://github.com/squaremo/amqp.node/pull/84)

## Changes in v0.2.0 (since v0.1.3)

    git log v0.1.3..v0.2.0

### Fixes

 * Correctly deal with missing fields (issue 48)

### Enhancements

 * Added a callback-oriented API, parallel to the existing,
   promise-oriented API.
 * The response to assertExchange now contains the exchange name,
   analagous to assertQueue (issue 49)
 * The channel method `prefetch` now has a global flag, to be
   [compatible with newer RabbitMQ][rabbitmq-prefetch-global].

## Changes in v0.1.3 (since v0.1.2)

    git log v0.1.2..v0.1.3

### Enhancements

 * Add support in the API for using Basic.Reject rather than
   Basic.Nack, the latter of which is a RabbitMQ extension and not in
   older versions of RabbitMQ.

## Changes in v0.1.2 (since v0.1.1)

    git log v0.1.1..v0.1.2

### Fixes

 * Restore support for publishing zero-length messages

### Enhancements

 * Recognise [authentication failures][rabbitmq-auth-failure]
 * An option to set TCP_NODELAY on connection sockets

## Changes in v0.1.1 (since v0.1.0)

    git log v0.1.0..v0.1.1

### Fixes

 * Safer frame construction, no longer relies on allocating a large,
   fixed-size buffer and hoping it's big enough
 * The ports of RabbitMQ tutorials now avoid a race between publishing
   and closing the connection

### Enhancements

 * Support for RabbitMQ's consumer priority extension
 * Support for RabbitMQ's connnection.blocked extension
 * Better write speed from batching frames for small messages
 * Other minor efficiency gains in method encoding and decoding
 * Channel and connection state errors (e.g., trying to write when
   closed) include a stack trace from when they moved to that state
 * The `arguments` table, passed as an option to some methods, can
   include fields in its prototype chain
 * Provide the more accurately named `persistent` as a near equivalent
   of `deliveryMode`

## Changes in v0.1.0 (since v0.0.2)

    git log v0.0.2..v0.1.0

### Breaking changes

 * Consumer callbacks are invoked with `null` if the consumer is
   cancelled (see
   [RabbitMQ's consumer cancel notification][rabbitmq-consumer-cancel])
 * In confirm channels, instead of `#publish` and `#sendToQueue`
   returning promises, they return a boolean as for normal channels,
   and take a Node.JS-style `function (err, ok)` callback for the
   server ack or nack

### Fixes

 * Overlapping channel and connection close frames are dealt with
   gracefully
 * Exceptions thrown in consumer callbacks are raised as `'error'`
   events
 * Zero-size messages are handled
 * Avoid monkey-patching `Buffer`, and eschew
   `require('util')._extend`

### Enhancements

 * Channels now behave like `Writable` streams with regard to `#publish`
   and `#sendToQueue`, returning a boolean from those methods and
   emitting `'drain'`
 * Connections now multiplex frames from channels fairly
 * Low-level channel machinery is now fully callback-based


[rabbitmq-consumer-cancel]: http://www.rabbitmq.com/consumer-cancel.html
[rabbitmq-auth-failure]: http://www.rabbitmq.com/auth-notification.html
[rabbitmq-prefetch-global]: http://www.rabbitmq.com/consumer-prefetch.html
