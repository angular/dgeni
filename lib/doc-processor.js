var _ = require('lodash');
var log = require('winston');

/**
 * Build a function to process the documents by running the given plugins
 * @param  {object} tagParser The thing that will parse the tags from the documents
 * @param  {object} tagDefs   The definitions of how to extract tags info from the parsed tags
 * @param  {function} plugins The plugins to apply to the docs
 * @return {function}         The function that will process the docs
 */
module.exports = function docProcessorFactory(config) {

  var plugins = config.processor.plugins;

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
        docs = plugin.before(docs, tagParser) || docs;
      }
    });

    // Process each of the docs in turn
    _.forEach(docs, function(doc) {

      // Extract meta-data from the tags
      extractTags(doc);

      // Run the "each" plugins over each of the doc
      _.forEach(plugins,function(plugin) {
        if ( plugin.each ) {
          plugin.each(doc, tagParser);
        }
      });
    });

    // Run the "after" plugins over the docs
    _.forEach(plugins,function(plugin) {
      if ( plugin.after ) {
        docs = plugin.after(docs, tagParser) || docs;
      }
    });

    _.forEach(docs, function(doc) {
      log.debug('Processed doc', doc.id);
    });

    return docs;
  };
};