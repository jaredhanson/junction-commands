/**
 * Module dependencies.
 */
var Client = require('./client');
var Component = require('./component');


/**
 * Create a new Junction/Commands connection.
 *
 * Options:
 *   - `jid`            JID
 *   - `password`       Password, for authentication
 *   - `host`
 *   - `port`
 *   - `type`           Type of connection, see below for types
 *   - `disableStream`  Disable underlying stream, defaults to _false_
 *
 * Connection Types:
 *   - `client`     XMPP client connection
 *   - `component`  XMPP component connection
 *
 * Examples:
 *
 *     var client = commands.createConnection({
 *       type: 'client',
 *       jid: 'user@example.com',
 *       password: 'secret',
 *       host: 'example.com',
 *       port: 5222
 *     });
 *
 * @param {Object} options
 * @return {Connection}
 * @api public
 */
exports.createConnection = function (options) {
  if (options.type == 'component') {
    return new Component(options);
  }
  return new Client(options);
};


/**
 * Expose constructors.
 */
exports.Client = Client;
exports.Component = Component;

/**
 * Expose bundled middleware.
 */
exports.middleware = {};
exports.middleware.payloadParser = require('./middleware/payloadParser');
