/**
 * @module dgeni
 */
module.exports = {
  log: require('winston'),
  Config: require('./config').Config,
  Package: require('./package'),
  DocGenerator: require('./doc-generator')
};