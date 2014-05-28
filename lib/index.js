/**
 * @module dgeni
 */
module.exports = {
  log: require('winston'),
  Config: require('./config').Config,
  generator: require('./doc-generator')
};