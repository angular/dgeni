// Node.js has to be run with --harmony_collections to support ES6 Map.
// If not defined, include a polyfill.
require('es6-shim');


/**
 * @module dgeni
 */
module.exports = {
  log: require('winston'),
  Config: require('./config').Config,
  loadConfig: require('./config').load,
  generator: require('./doc-generator')
};