var _ = require('lodash');
var log = require('winston');
var DepGraph = require('dependency-graph').DepGraph;
var di = require('di');
var Q = require('q');

/**
 * Build a function to process the documents by running the given processors
 * @param  {object} config   A configuration object that defines things like processors
 * @return {function}         The function that will process the docs
 */
module.exports = function docProcessorFactory(config) {

  if ( !config || !config.processing ) {
    throw new Error('Invalid config - you must provide a config object with a "processing" property');
  }

  var processors =  config.processing.processors.concat([
    { name: 'loading-files' },
    { name: 'files-loaded', runAfter: ['loading-files'] },
    { name: 'parsing-tags', runAfter: ['files-loaded'] },
    { name: 'tags-parsed', runAfter: ['parsing-tags'] },
    { name: 'extracting-tags', runAfter: ['tags-parsed'] },
    { name: 'tags-extracted', runAfter: ['extracting-tags'] },
    { name: 'processing-docs', runAfter: ['tags-extracted'] },
    { name: 'docs-processed', runAfter: ['processing-docs'] },
    { name: 'adding-extra-docs', runAfter: ['docs-processed'] },
    { name: 'extra-docs-added', runAfter: ['adding-extra-docs'] },
    { name: 'rendering-docs', runAfter: ['extra-docs-added'] },
    { name: 'docs-rendered', runAfter: ['rendering-docs'] },
    { name: 'writing-files', runAfter: ['docs-rendered'] },
    { name: 'files-written', runAfter: ['writing-files'] }
  ]);


  log.debug('Processors Loaded:', _.map(processors, 'name'));


  // Compute the order in which the processors should run
  var processorMap = {};
  var depGraph = new DepGraph();
  _.forEach(processors, function(processor, index) {
    if ( !processor.name ) {
      throw new Error('Missing name property on processor #' + (index+1));
    }
    processorMap[processor.name] = processor;
    depGraph.addNode(processor.name);
  });
  _.forEach(processors, function(processor) {
    if ( processor.runAfter && !_.isArray(processor.runAfter) ) {
      throw new Error('Error in processor "' + processor.name + '" - runAfter must be an array');
    }
    _.forEach(processor.runAfter, function(dependency) {
      depGraph.addDependency(processor.name, dependency);
    });

    if ( processor.runBefore && !_.isArray(processor.runBefore) ) {
      throw new Error('Error in processor "' + processor.name + '" - runBefore must be an array');
    }
    _.forEach(processor.runBefore, function(dependency) {
      depGraph.addDependency(dependency, processor.name);
    });
  });
  processors = _.map(depGraph.overallOrder(), function(processorName) {
    log.debug('processor:', processorName);
    return processorMap[processorName];
  });

  // Create the dependency injection container
  var baseInjector;
  var injectables = new di.Module();
  injectables.value('config', config);
  injectables.factory('extraData', function(injector) {
    return injector._instances;
  });

  // This function will create a child injector that has a reference to the injector itself
  // and also to the docs object, if provided
  function createChildInjector(baseInjector, docs) {
    var module = new di.Module();
    module.factory('injector', function() { return baseInjector; });
    if ( docs ) { module.value('docs', docs); }
    return new di.Injector([module], baseInjector);
  }

  // Initialize the processors, passing them the config object
  // and the injectables, so they can register new things with the injector
  _.forEach(processors, function initializeprocessor(processor) {
    if ( processor.init ) {
      log.debug('initializing', processor.name);
      processor.init(config, injectables);
    }
  });

  baseInjector = new di.Injector([injectables]);

  /**
   * Process the docs
   * @param  {array} docs Collection of docs to process
   * @return {array}      The processed docs
   */
  return function(docs) {

    docs = docs || [];

    var processingPromise = Q(docs);

    // Run the "before" processors over the docs
    _.forEach(processors,function(processor) {
      if ( processor.process ) {
        processingPromise = processingPromise.then(function(docs) {

          var docsInjector = createChildInjector(baseInjector, docs);
          log.info('running processor:', processor.name);

          // The processor should return a promise, a new docs object or undefined
          return docsInjector.invoke(processor.process) || docs;
        }).catch(function(error) {
          error.message = 'Error running processor "' + processor.name + '":\n' + error.message;
          if ( config.processing.stopOnError ) {
            throw error;
          } else {
            log.error(error.stack);
            return docs;
          }
        });
      }
    });

    processingPromise.catch(function(error) {
      log.error('Error processing docs:\n' + error.stack);
    });

    return processingPromise;
  };
};