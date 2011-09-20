var vows = require('vows');
var assert = require('assert');
var util = require('util');
var IQ = require('junction').elements.IQ;
var StanzaError = require('junction').StanzaError;
var commandParser = require('junction-commands/middleware/commandParser');


vows.describe('commandParser').addBatch({

  'middleware': {
    topic: function() {
      return commandParser();
    },
    
    'when handling a command': {
      topic: function(commandParser) {
        var self = this;
        var req = new IQ('responder@domain', 'set');
        req.c('command', { xmlns: 'http://jabber.org/protocol/commands',
                            node: 'list', action: 'execute' });
        req = req.toXML();
        req.type = req.attrs.type;
        
        function next(err) {
          self.callback(err, req);
        }
        process.nextTick(function () {
          commandParser(req, next)
        });
      },
      
      'should set action property' : function(err, req) {
        assert.equal(req.action, 'execute');
      },
      'should set node property' : function(err, req) {
        assert.equal(req.node, 'list');
      },
    },
    
    'when handling a command without an action': {
      topic: function(commandParser) {
        var self = this;
        var req = new IQ('responder@domain', 'set');
        req.c('command', { xmlns: 'http://jabber.org/protocol/commands',
                            node: 'list' });
        req = req.toXML();
        req.type = req.attrs.type;
        
        function next(err) {
          self.callback(err, req);
        }
        process.nextTick(function () {
          commandParser(req, next)
        });
      },
      
      'should default action property to execute' : function(err, req) {
        assert.equal(req.action, 'execute');
      },
      'should set node property' : function(err, req) {
        assert.equal(req.node, 'list');
      },
    },
    
    'when handling an IQ-get command': {
      topic: function(commandParser) {
        var self = this;
        var req = new IQ('responder@domain', 'get');
        req.c('command', { xmlns: 'http://jabber.org/protocol/commands',
                            node: 'list', action: 'execute' });
        req = req.toXML();
        req.type = req.attrs.type;
        
        function next(err) {
          self.callback(err, req);
        }
        process.nextTick(function () {
          commandParser(req, next)
        });
      },
      
      'should indicate an error' : function(err, stanza) {
        assert.instanceOf(err, StanzaError);
        assert.equal(err.type, 'modify');
        assert.equal(err.condition, 'bad-request');
      },
    },
    
    'when handling an IQ stanza that is a command result': {
      topic: function(commandParser) {
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
          commandParser(req, next)
        });
      },
      
      'should not set action property' : function(err, stanza) {
        assert.isUndefined(stanza.action);
      },
      'should not set node property' : function(err, stanza) {
        assert.isUndefined(stanza.node);
      },
    },
    
    'when handling an IQ stanza that is not a command': {
      topic: function(commandParser) {
        var self = this;
        var iq = new IQ('romeo@example.net', 'juliet@example.com', 'get');
        iq = iq.toXML();
        iq.type = iq.attrs.type;
        
        function next(err) {
          self.callback(err, iq);
        }
        process.nextTick(function () {
          commandParser(iq, next)
        });
      },
      
      'should not set action property' : function(err, stanza) {
        assert.isUndefined(stanza.action);
      },
      'should not set node property' : function(err, stanza) {
        assert.isUndefined(stanza.node);
      },
    },
  },

}).export(module);
