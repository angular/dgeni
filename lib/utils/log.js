var LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARNING: 2,
  ERROR: 3
};

var logLevel = LEVELS.WARNING;

module.exports = {
  debug: function() {
    if ( logLevel <= LEVELS.DEBUG ) {
      console.log.apply(console, Array.prototype.slice.call(arguments));
    }
  },
  info: function() {
    if ( logLevel <= LEVELS.INFO ) {
      console.log.apply(console, Array.prototype.slice.call(arguments));
    }
  },
  warning: function() {
    if ( logLevel <= LEVELS.WARNING ) {
      console.log.apply(console, Array.prototype.slice.call(arguments));
    }
  },
  error: function() {
    if ( logLevel <= LEVELS.ERROR ) {
      console.log.apply(console, Array.prototype.slice.call(arguments));
    }
  },
  setLogLevel: function(level) {
    logLevel = level;
  },
  LEVELS : LEVELS
};