/**
 * @module dgeni
 */
module.exports = {
  log: require('winston'),
  Config: require('./config').Config,
  loadConfig: require('./config').load,
  generator: require('./doc-generator')
};