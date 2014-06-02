var _ = require('lodash');
var log = require('winston');
var di = require('di');
var Q = require('q');
var Config = require('./config');

// This function will create a child injector that has a reference to the injector itself
// and also to the docs object, if provided
function createChildInjector(baseInjector, docs, processor, config) {

  var processorConfig = new Config(config, processor.name);

  var module = new di.Module();

  // Add the base injector to the child injector
  module.factory('injector', function() { return baseInjector; });

  // Add the docs to the injector
  if ( docs ) { module.value('docs', docs); }

  // Add each of this processor's config properties
  _.forEach(processor.config, function(_, propertyPath) {
    module.value(propertyPath, processorConfig.get(propertyPath));
  });
  return new di.Injector([module], baseInjector);
}


/**
 * A factory that returns a function to process the documents.  This is achieved by passing each of the
 * documents through a pipe-line of processors, supported by a collection of services.
 *
 * Each processor can modify, remove and add documents.  Typically, the initial processors will read in
 * docs from some file source, then various transformations and manipulations will occur before the
 * documents are rendered and written out into the actual documentation files.
 *
 * @module doc-processor
 * @param  {Array} processors   A collection of processors to run on the docs
 * @param  {Object} services    A hash of services to support the processors, keyed on name
 * @param  {Config} Config      The configuration object for this generation
 * @return {function()}         The function that will process the docs
 */
module.exports = function docProcessorFactory(processors, services, config) {

  if ( !_.isArray(processors) ) { throw new Error('You must provide a collection of processors'); }
  if ( processors.length <= 0 ) { throw new Error('You must provide at least one processor'); }

  config = config || new Config();
  if ( !(config instanceof Config) ) {
    throw new Error('The config parameter must be of type Config');
  }

  // Create the dependency injection container
  var injectables = new di.Module();
  injectables.value('config', config);
  injectables.factory('extraData', function(injector) {
    return injector._instances;
  });

  // Add the services into the injector
  _.forEach(services, function(serviceFactory, serviceName) {
    injectables.factory(serviceName, serviceFactory);
  });

  var baseInjector = new di.Injector([injectables]);

  /**
   * Process the docs
   * @param  {array} docs Collection of docs to process
   * @return {array}      The processed docs
   */
  return function process(docs) {

    docs = docs || [];

    var processingPromise = Q(docs);

    // Run the processors over the docs
    _.forEach(processors,function(processor) {

      if( processor.process ) {

        processingPromise = processingPromise.then(function(docs) {

          log.info('running processor:', processor.name);
          var docsInjector = createChildInjector(baseInjector, docs, processor, config);

          // The processor should return a promise, a new docs object or undefined
          return docsInjector.invoke(processor.process) || docs;

        }).catch(function(error) {

          error.message = 'Error running processor "' + processor.name + '":\n' + error.message;
          if ( config.get('processing.stopOnError') ) { throw error; }
          log.error(error.stack);
          return docs;

        });

      }
    });

    processingPromise.catch(function(error) {
      log.error('Error processing docs:\n' + error.stack);
    });

    return processingPromise;
  };
};