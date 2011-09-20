var vows = require('vows');
var assert = require('assert');
var junction = require('junction');
var commands = require('junction-commands');
var util = require('util');


vows.describe('Module').addBatch({
  
  'create connection with client type': {
    topic: function() {
      return new commands.createConnection({ type: 'client', jid: 'user@invalid.host', disableStream: true });
    },
    
    'should be an instance of Client': function (c) {
      assert.instanceOf(c, commands.Client);
    },
  },
  
  'create connection with component type': {
    topic: function() {
      return new commands.createConnection({ type: 'component', jid: 'component.invalid.host', host: 'invalid.host', port: 5060, disableStream: true });
    },
    
    'should be an instance of Component': function (c) {
      assert.instanceOf(c, commands.Component);
    },
  },
  
}).export(module);
