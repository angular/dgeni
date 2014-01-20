var _ = require('lodash');
var log = require('winston');

/**
 * Build a function to process the documents by running the given processors
 * @param  {object} config   A configuration object that defines things like processors
 * @return {function}         The function that will process the docs
 */
module.exports = function docProcessorFactory(config) {

  if ( !config || !config.processing ) {
    throw new Error('Invalid config - you must provide a config object with a "processing" property');
  }

  var processors = config.processing.processors;

  /**
   * Process the docs
   * @param  {array} docs Collection of docs to process
   * @return {array}      The processed docs
   */
  return function(docs) {

    // Initialize the processors, passing them the config object
    _.forEach(processors, function initializeprocessor(processor) {
      if ( processor.init ) {
        log.debug('initializing', processor.name);
        processor.init(config);
      }
    });

    // Run the "before" processors over the docs
    _.forEach(processors,function(processor) {
      if ( processor.before ) {
        log.debug('running before', processor.name);
        docs = processor.before(docs) || docs;
      }
    });

    // Process each of the docs in turn
    _.forEach(docs, function(doc) {

      // Run the "each" processors over each of the doc
      _.forEach(processors,function(processor) {
        if ( processor.each ) {
          try {
            log.silly('running each', processor.name);
            processor.each(doc);
          } catch(e) {
            throw new Error('Error processing document "' + (doc.id || doc.name || 'unknown') +
              '" with processor "' + processor.name + '": ' + e);
          }
        }
      });
    });

    // Run the "after" processors over the docs
    _.forEach(processors,function(processor) {
      if ( processor.after ) {
        log.debug('running after', processor.name);
        docs = processor.after(docs) || docs;
      }
    });

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
  };
};