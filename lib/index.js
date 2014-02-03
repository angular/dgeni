var _ = require('lodash');
var log = require('winston');
var configurer = require('../lib/utils/config');
var docProcessorFactory = require('../lib/doc-processor');

module.exports = function docGeneratorFactory(config) {

  if ( _.isString(config) ) {
    config = configurer.load(config);
  }
  if ( !_.isObject(config) || !_.isFunction(config.applyTo) ) {
    throw new Error(
      'Invalid configuration.  The config parameter must be a configuration object\n' +
      'or a string pointing to a nodeJS module of the form:\n' +
      'module.exports = function(config) {\n' +
      '  ...\n' +
      '  return config;\n' +
      '};'
    );
  }

  log.cli();
  log.level = config.logging.level;
  log.debug('basePath: ', config.basePath);
  log.debug('Initializing components');

  var processDocs = docProcessorFactory(config);

  return {
    generateDocs: function() {
      log.info('Processing docs');
      return processDocs().then(function(docs) {
        log.info('Processed', docs.length, 'docs');
      });
    }
  };
};