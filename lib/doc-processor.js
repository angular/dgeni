var _ = require('lodash');
var log = require('winston');

/**
 * Build a function to process the documents by running the given plugins
 * @param  {object} config   A configuration object that defines things like plugins
 * @return {function}         The function that will process the docs
 */
module.exports = function docProcessorFactory(config) {

  if ( !config || !config.processing || !config.processing.plugins ) {
    throw new Error('Invalid config.\n'+
    'You must provide an array of tag definitions, at config.processing.plugins');
  }
  var plugins = config.processing.plugins;

  /**
   * Process the docs
   * @param  {array} docs Collection of docs to process
   * @return {array}      The processed docs
   */
  return function(docs) {

    // Initialize the plugins, passing them the config object
    _.forEach(plugins, function initializePlugin(plugin) {
      if ( plugin.init ) {
        plugin.init(config);
      }
    });

    // Run the "before" plugins over the docs
    _.forEach(plugins,function(plugin) {
      if ( plugin.before ) {
        docs = plugin.before(docs) || docs;
      }
    });

    // Process each of the docs in turn
    _.forEach(docs, function(doc) {

      // Run the "each" plugins over each of the doc
      _.forEach(plugins,function(plugin) {
        if ( plugin.each ) {
          plugin.each(doc);
        }
      });
    });

    // Run the "after" plugins over the docs
    _.forEach(plugins,function(plugin) {
      if ( plugin.after ) {
        docs = plugin.after(docs) || docs;
      }
    });

    _.forEach(docs, function(doc) {
      log.debug('Processed doc', doc.id);
    });

    return docs;
  };
};