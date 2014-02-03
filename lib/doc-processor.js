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
    { name: 'docs-rendered', runAfter: ['rendering-docs'] }
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
    _.forEach(processor.runAfter, function(dependency) {
      depGraph.addDependency(processor.name, dependency);
    });
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
  injectables.value('extraData', {});

  // This function will create a child injector that has a reference to the injector itself
  // and also to the docs and doc objects, if provided
  function createChildInjector(baseInjector, docs, doc) {
    var module = new di.Module();
    module.factory('injector', function() { return baseInjector; });
    if ( docs ) { module.value('docs', docs); }
    if ( doc ) { module.value('doc', doc); }
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
      if ( processor.before ) {
        processingPromise = processingPromise.then(function(docs) {

          var docsInjector = createChildInjector(baseInjector, docs);
          log.debug('running before', processor.name);

          // The processor should return a promise, a new docs object or undefined
          return docsInjector.invoke(processor.before) || docs;
        });
      }
    });

    // Process each of the docs in turn
    processingPromise = processingPromise.then(function(docs) {

      // Lets assume for the minute that the "each" processors are synchronous
      _.forEach(docs, function(doc) {

        var docInjector = createChildInjector(baseInjector, docs, doc);

        // Run the "each" processors over each of the doc
        _.forEach(processors,function(processor) {
          if ( processor.each ) {
            try {
              log.silly('running each', processor.name);
              docInjector.invoke(processor.each);
            } catch(e) {
              throw new Error('Error processing document "' + (doc.id || doc.name || 'unknown') +
                '" with processor "' + processor.name + '": ' + e.stack);
            }
          }
        });
      });

      return docs;
    });

    // Run the "after" processors over the docs
    _.forEach(processors,function(processor) {
      if ( processor.after ) {
        processingPromise = processingPromise.then(function(docs) {
          var docsInjector = createChildInjector(baseInjector, docs);
          log.debug('running after', processor.name);
          return docsInjector.invoke(processor.after) || docs;
        });
      }
    });

    processingPromise = processingPromise.then(function(docs) {

      _.forEach(docs, function(doc) {
        log.debug('Processed doc', doc.id);
      });

      if ( config.processing.dumpToFile ) {
        var util = require('util');
        contents = '';
        _.forEach(docs, function(doc) {
          contents += '\n\n\n' + util.inspect(doc, { depth: 3 });
        });
        var fs = require('fs');
        fs.writeFileSync(config.processing.dumpToFile, contents);
      }

      return docs;
    });

    return processingPromise;
  };
};