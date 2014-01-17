var _ = require('lodash');
var log = require('winston');

/**
 * Build a function to process the documents by running the given plugins
 * @param  {object} config   A configuration object that defines things like plugins
 * @return {function}         The function that will process the docs
 */
module.exports = function docProcessorFactory(plugins, config) {

  if ( !config || !config.processing ) {
    throw new Error('Invalid config - you must provide a config object with a "processing" property');
  }

  /**
   * Process the docs
   * @param  {array} docs Collection of docs to process
   * @return {array}      The processed docs
   */
  return function(docs) {

    // Initialize the plugins, passing them the config object
    _.forEach(plugins, function initializePlugin(plugin) {
      if ( plugin.init ) {
        log.debug('initializing', plugin.name);
        plugin.init(config);
      }
    });

    // Run the "before" plugins over the docs
    _.forEach(plugins,function(plugin) {
      if ( plugin.before ) {
        log.debug('running before', plugin.name);
        docs = plugin.before(docs) || docs;
      }
    });

    // Process each of the docs in turn
    _.forEach(docs, function(doc) {

      // Run the "each" plugins over each of the doc
      _.forEach(plugins,function(plugin) {
        if ( plugin.each ) {
          try {
            log.silly('running each', plugin.name);
            plugin.each(doc);
          } catch(e) {
            throw new Error('Error processing document "' + (doc.id || doc.name || 'unknown') +
              '" with processor "' + plugin.name + '": ' + e);
          }
        }
      });
    });

    // Run the "after" plugins over the docs
    _.forEach(plugins,function(plugin) {
      if ( plugin.after ) {
        log.debug('running after', plugin.name);
        docs = plugin.after(docs) || docs;
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