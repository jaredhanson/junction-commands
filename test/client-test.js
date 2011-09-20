var vows = require('vows');
var assert = require('assert');
var junction = require('junction');
var util = require('util');
var Client = require('junction-commands/client');


vows.describe('Client').addBatch({
  
  'initialization': {
    topic: function() {
      return new Client({ jid: 'catalog.shakespeare.lit', disableStream: true });
    },
    
    'should have an execute function': function (c) {
      assert.isFunction(c.execute);
    },
    'should have an cancel function': function (c) {
      assert.isFunction(c.cancel);
    },
    'should have an prev function': function (c) {
      assert.isFunction(c.prev);
    },
    'should have an next function': function (c) {
      assert.isFunction(c.next);
    },
    'should have an complete function': function (c) {
      assert.isFunction(c.complete);
    },
  },
  
  'routing a query to a node': {
    topic: function() {
      var self = this;
      var client = new Client({ jid: 'requester@domain', disableStream: true });
      client.execute('list', function(req, res, next) {
        self.callback(null, req);
      });
      process.nextTick(function () {
        var iq = new junction.elements.IQ('responder@domain', 'requester@domain', 'set');
        iq.id = 'exec1';
        iq.c('command', { xmlns: 'http://jabber.org/protocol/commands',
                           node: 'list', action: 'execute' });
        client.emit('stanza', iq.toXML());
      });
    },
    
    'should dispatch a request': function (err, stanza) {
      assert.isNotNull(stanza);
    },
  },
  
  'routing a query to a node with middleware': {
    topic: function() {
      var self = this;
      
      function doSomething(req, res, next) {
        req.calls = 1;
        next();
      }
      
      var client = new Client({ jid: 'requester@domain', disableStream: true });
      client.execute('list', doSomething, function(req, res, next) {
        self.callback(null, req);
      });
      process.nextTick(function () {
        var iq = new junction.elements.IQ('responder@domain', 'requester@domain', 'set');
        iq.id = 'exec1';
        iq.c('command', { xmlns: 'http://jabber.org/protocol/commands',
                           node: 'list', action: 'execute' });
        client.emit('stanza', iq.toXML());
      });
    },
    
    'should dispatch a request': function (err, stanza) {
      assert.isNotNull(stanza);
    },
    'should invoke middleware': function (err, stanza) {
      assert.equal(stanza.calls, 1);
    },
  },
  
  'routing a query to a node with multiple middleware': {
    topic: function() {
      var self = this;
      
      function doSomething(req, res, next) {
        req.calls = 1;
        next();
      }
      function doSomethingElse(req, res, next) {
        req.calls++;
        next();
      }
      
      var client = new Client({ jid: 'requester@domain', disableStream: true });
      client.execute('list', doSomething, doSomethingElse, function(req, res, next) {
        self.callback(null, req);
      });
      process.nextTick(function () {
        var iq = new junction.elements.IQ('responder@domain', 'requester@domain', 'set');
        iq.id = 'exec1';
        iq.c('command', { xmlns: 'http://jabber.org/protocol/commands',
                           node: 'list', action: 'execute' });
        client.emit('stanza', iq.toXML());
      });
    },
    
    'should dispatch a request': function (err, stanza) {
      assert.isNotNull(stanza);
    },
    'should invoke middleware': function (err, stanza) {
      assert.equal(stanza.calls, 2);
    },
  },
  
  'routing a query to a node with multiple middleware as an array': {
    topic: function() {
      var self = this;
      
      function doSomething(req, res, next) {
        req.calls = 1;
        next();
      }
      function doSomethingElse(req, res, next) {
        req.calls++;
        next();
      }
      var doAll = [doSomething, doSomethingElse];
      
      var client = new Client({ jid: 'requester@domain', disableStream: true });
      client.execute('list', doAll, function(req, res, next) {
        self.callback(null, req);
      });
      process.nextTick(function () {
        var iq = new junction.elements.IQ('responder@domain', 'requester@domain', 'set');
        iq.id = 'exec1';
        iq.c('command', { xmlns: 'http://jabber.org/protocol/commands',
                           node: 'list', action: 'execute' });
        client.emit('stanza', iq.toXML());
      });
    },
    
    'should dispatch a request': function (err, stanza) {
      assert.isNotNull(stanza);
    },
    'should invoke middleware': function (err, stanza) {
      assert.equal(stanza.calls, 2);
    },
  },
  
  'routing a query to a node with multiple middleware as multiple arrays': {
    topic: function() {
      var self = this;
      
      function doSomething(req, res, next) {
        req.calls = 1;
        next();
      }
      function doSomethingElse(req, res, next) {
        req.calls++;
        next();
      }
      function otherStuff(req, res, next) {
        req.calls++;
        next();
      }
      function otherThings(req, res, next) {
        req.calls++;
        next();
      }
      var doAll = [doSomething, doSomethingElse];
      var otherAll = [otherStuff, otherThings];
      
      var client = new Client({ jid: 'requester@domain', disableStream: true });
      client.execute('list', doAll, otherAll, function(req, res, next) {
        self.callback(null, req);
      });
      process.nextTick(function () {
        var iq = new junction.elements.IQ('responder@domain', 'requester@domain', 'set');
        iq.id = 'exec1';
        iq.c('command', { xmlns: 'http://jabber.org/protocol/commands',
                           node: 'list', action: 'execute' });
        client.emit('stanza', iq.toXML());
      });
    },
    
    'should dispatch a request': function (err, stanza) {
      assert.isNotNull(stanza);
    },
    'should invoke middleware': function (err, stanza) {
      assert.equal(stanza.calls, 4);
    },
  },
  
  'routing a query to a node with a capture': {
    topic: function() {
      var self = this;
      var client = new Client({ jid: 'requester@domain', disableStream: true });
      client.execute('/commands/:command', function(req, res, next) {
        self.callback(null, req);
      });
      process.nextTick(function () {
        var iq = new junction.elements.IQ('responder@domain', 'requester@domain', 'set');
        iq.id = 'exec1';
        iq.c('command', { xmlns: 'http://jabber.org/protocol/commands',
                           node: '/commands/config', action: 'execute' });
        client.emit('stanza', iq.toXML());
      });
    },
    
    'should dispatch a request': function (err, stanza) {
      assert.isNotNull(stanza);
    },
    'should set params': function (err, stanza) {
      assert.equal(stanza.params.command, 'config');
    },
  },
  
  'routing a query to a node with multiple captures': {
    topic: function() {
      var self = this;
      var client = new Client({ jid: 'requester@domain', disableStream: true });
      client.execute('/commands/:ns/:name', function(req, res, next) {
        self.callback(null, req);
      });
      process.nextTick(function () {
        var iq = new junction.elements.IQ('responder@domain', 'requester@domain', 'set');
        iq.id = 'exec1';
        iq.c('command', { xmlns: 'http://jabber.org/protocol/commands',
                           node: '/commands/controls/play', action: 'execute' });
        client.emit('stanza', iq.toXML());
      });
    },
    
    'should dispatch a request': function (err, stanza) {
      assert.isNotNull(stanza);
    },
    'should set params': function (err, stanza) {
      assert.equal(stanza.params.ns, 'controls');
      assert.equal(stanza.params.name, 'play');
    },
  },
  
}).export(module);
