var _ = require('lodash');
var log = require('winston');
var configurer = require('../lib/config');
var docProcessorFactory = require('../lib/doc-processor');

/**
 * The Dgeni documentation generator
 * @module dgeni
 * @param  {Config|string} config Information on how Dgeni should generate the documentation.
 *                                If it is a string then we treat it as a file path to a config
 *                                file to load
 * @return {function(): Promise}  A function that will generate the docs based on the provided
 *                                configuration
 */
module.exports = function docGeneratorFactory(config) {

  if ( _.isString(config) ) {
    config = configurer.load(config);
  }

  if ( !(config instanceof configurer.Config) ) {
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
  log.level = config.get('logging.level', 'info');

  log.debug('basePath: ', config.basePath);
  log.debug('Initializing components');

  var processDocs = docProcessorFactory(config);

    /**
     * Generate the documentation based on the configuration provided to the enclosing function
     * @return {Promise} A promise to the result of processing the documentation
     */
  return function() {
    log.info('Processing docs');
    return processDocs().then(function(docs) {
      log.info('Processed', docs.length, 'docs');
    });
  };
};