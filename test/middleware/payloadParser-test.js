var vows = require('vows');
var assert = require('assert');
var util = require('util');
var IQ = require('junction').elements.IQ;
var payloadParser = require('junction-commands/middleware/payloadParser');


payloadParser.parse['http://schemas.example.com/xml/foo:echo'] = function(x) {
  return { text: x.attrs['text'] };
}


vows.describe('payloadParser').addBatch({

  'middleware': {
    topic: function() {
      return payloadParser();
    },
    
    'when handling a command with a registered payload': {
      topic: function(payloadParser) {
        var self = this;
        var req = new IQ('responder@domain', 'set');
        req.c('command', { xmlns: 'http://jabber.org/protocol/commands',
                            node: 'list', action: 'execute' })
           .c('echo', { text: 'Hello World', xmlns: 'http://schemas.example.com/xml/foo' });
        req = req.toXML();
        req.type = req.attrs.type;
        
        function next(err) {
          self.callback(err, req);
        }
        process.nextTick(function () {
          payloadParser(req, next)
        });
      },
      
      'should not set format property' : function(err, stanza) {
        assert.isObject(stanza.format);
        assert.equal(stanza.format.xmlns, 'http://schemas.example.com/xml/foo');
        assert.equal(stanza.format.name, 'echo');
      },
      'should not set payload property' : function(err, stanza) {
        assert.isObject(stanza.payload);
        assert.equal(stanza.payload.text, 'Hello World');
      },
    },
    
    'when handling a command with an unknown payload': {
      topic: function(payloadParser) {
        var self = this;
        var req = new IQ('responder@domain', 'set');
        req.c('command', { xmlns: 'http://jabber.org/protocol/commands',
                            node: 'list', action: 'execute' })
           .c('unknown', { xmlns: 'http://schemas.example.com/xml/foo' });
        req = req.toXML();
        req.type = req.attrs.type;
        
        function next(err) {
          self.callback(err, req);
        }
        process.nextTick(function () {
          payloadParser(req, next)
        });
      },
      
      'should not set format property' : function(err, stanza) {
        assert.isUndefined(stanza.format);
      },
      'should not set payload property' : function(err, stanza) {
        assert.isUndefined(stanza.payload);
      },
    },
    
    'when handling an IQ stanza that is a command result': {
      topic: function(payloadParser) {
        var self = this;
        var req = new IQ('requester@domain', 'responder@domain', 'result');
        req.c('command', { xmlns: 'http://jabber.org/protocol/commands',
                       sessionid: 'list:20020923T213616Z-700', node: 'list', status: 'completed' });
        req = req.toXML();
        req.type = req.attrs.type;
        
        function next(err) {
          self.callback(err, req);
        }
        process.nextTick(function () {
          payloadParser(req, next)
        });
      },
      
      'should not set format property' : function(err, stanza) {
        assert.isUndefined(stanza.format);
      },
      'should not set payload property' : function(err, stanza) {
        assert.isUndefined(stanza.payload);
      },
    },
    
    'when handling an IQ stanza that is not a command': {
      topic: function(payloadParser) {
        var self = this;
        var iq = new IQ('romeo@example.net', 'juliet@example.com', 'get');
        iq = iq.toXML();
        iq.type = iq.attrs.type;
        
        function next(err) {
          self.callback(err, iq);
        }
        process.nextTick(function () {
          payloadParser(iq, next)
        });
      },
      
      'should not set format property' : function(err, stanza) {
        assert.isUndefined(stanza.format);
      },
      'should not set payload property' : function(err, stanza) {
        assert.isUndefined(stanza.payload);
      },
    },
  },

}).export(module);
