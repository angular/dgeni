/**
 * @module dgeni
 */
module.exports = {
  log: require('winston'),
  Config: require('./config'),
  Package: require('./package'),
  Validate: require('./validate'),
  DocGenerator: require('./doc-generator')
};