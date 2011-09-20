/**
 * Module dependencies.
 */
var util = require('util')
  , StanzaError = require('junction').StanzaError;


/**
 * Parse commands.
 *
 * This middleware parses information contained within _command_ elements in the
 * _http://jabber.org/protocol/commands_ namespace.  `stanza.action` indicates
 * the action.  `stanza.node` indicates the command (and node identifier)
 * associated with an entity.
 *
 * Junction/Commands activates this middleware automatically.  Your program
 * should not need to use it manually.
 *
 * References:
 * - [XEP-0050: Ad-Hoc Commands](http://xmpp.org/extensions/xep-0050.html)
 *
 * @return {Function}
 * @api private
 */

module.exports = function commandParser() {
  
  return function commandParser(req, next) {
    if (!req.is('iq')) { return next(); }
    if (req.type == 'result' || req.type == 'error') { return next(); }
    var command = req.getChild('command', 'http://jabber.org/protocol/commands');
    if (!command) { return next(); }
    
    if (req.type != 'set') {
      return next(new StanzaError("Command must be an IQ-set stanza.", 'modify', 'bad-request'));
    }
    
    req.action = command.attrs.action || 'execute';
    req.node = command.attrs.node;
    next();
  }
}
