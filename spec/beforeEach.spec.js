var log = require('winston');

// Apart from providing us with a nice way to programmatically check the logging
// messages, this also prevents unwanted messages being written to the console.

beforeEach(function() {
  log._errors = [];
  spyOn(log, 'error').andCallFake(function() {
    log._errors.push(arguments);
  });

  log._warns = [];
  spyOn(log, 'warn').andCallFake(function() {
    log._warns.push(arguments);
  });

  log._infos = [];
  spyOn(log, 'info').andCallFake(function() {
    log._infos.push(arguments);
  });

  log._debugs = [];
  spyOn(log, 'debug').andCallFake(function() {
    log._debugs.push(arguments);
  });

  log._sillys = [];
  spyOn(log, 'silly').andCallFake(function() {
    log._sillys.push(arguments);
  });

  spyOn(log, 'cli');
});