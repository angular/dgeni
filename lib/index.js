/**
 * @module dgeni
 */
module.exports = {
  log: require('winston'),
  Config: require('./config').Config,
  Package: require('./package'),
  generator: require('./doc-generator')
};