/**
 * Parse command payloads.
 *
 * You may map `commands.middleware.payloadParser.parse[xmlns:element]` to a
 * a function implemented by your application to replace existing parsers, or
 * implement one for other XML namespaces.
 *
 * Examples:
 *
 *     commands.middleware.payloadParser.parse['http://schemas.example.com/xml/foo:bar'] = function(xml) {
 *       var result = parse(xml);
 *       return result;
 *     }
 *
 * Junction/Commands activates this middleware automatically.  Your program
 * should not need to use it manually.
 *
 * References:
 * - [XEP-0050: Ad-Hoc Commands](http://xmpp.org/extensions/xep-0050.html)
 *
 * @return {Function}
 * @api public
 */
exports = module.exports = function payloadParser() {
  
  return function payloadParser(req, next) {
    if (!req.is('iq')) { return next(); }
    if (req.type == 'result' || req.type == 'error') { return next(); }
    var command = req.getChild('command', 'http://jabber.org/protocol/commands');
    if (!command) { return next(); }
    
    for (var i = 0, len = command.children.length; i < len; i++) {
      var xml = command.children[i];
      var qname = xml.getNS() + ':' + xml.getName();
      var parser = exports.parse[qname];
      if (parser) {
        try {
          req.format = { name: xml.getName(), xmlns: xml.getNS() };
          req.payload = parser(xml);
          return next();
        } catch (err) {
          return next(err);
        }
      }
    }
    
    next();
  }
}


/**
 * Supported decoders.
 *
 *  - <x xmlns="jabber:x:data"/>
 */

exports.parse = {
  'jabber:x:data:x': xdataParse
};

function xdataParse(xml) {
  // TODO: Implement Data Forms support.
}

