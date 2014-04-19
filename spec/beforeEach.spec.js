// Node.js has to be run with --harmony_collections to support ES6 Map.
// If not defined, include a polyfill.
require('es6-shim');

var log = require('winston');
log.remove(log.transports.Console);


//TODO: Add a custom transport that logs to an array