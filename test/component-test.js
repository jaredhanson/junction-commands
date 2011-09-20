var vows = require('vows');
var assert = require('assert');
var junction = require('junction');
var util = require('util');
var Component = require('junction-commands/component');


vows.describe('Component').addBatch({
  
  'initialization': {
    topic: function() {
      return new Component({ jid: 'component.invalid.host', host: 'invalid.host', port: 5060, disableStream: true });
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
  
}).export(module);
