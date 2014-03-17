/**
 * @module dgeni
 */
module.exports = {
  log: require('winston'),
  Config: require('../lib/config').Config,
  loadConfig: require('../lib/config').load,
  generator: require('./doc-generator')
};