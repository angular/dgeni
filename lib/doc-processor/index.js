var _ = require('lodash');
var doctrine = require('doctrine');

/**
 * Build a function to process the documents by running the given plugins
 * @param  {function} plugins The plugins to apply to the docs
 * @return {function}         The function that will process the docs
 */
module.exports = function docParserFactory(plugins) {

  console.log('plugins', plugins.length);

  /**
   * Process the docs
   * @param  {array} docs Collection of docs to process
   * @return {array}      The processed docs
   */
  return function(docs) {
      
    // Parse the tags from the docs
    _.forEach(docs, function(doc) {
      var parsed = doctrine.parse(doc.content);
      doc.description = parsed.description;
      doc.tags = parsed.tags;
    });

    // Run the "before" plugins over the docs
    _.forEach(plugins,function(plugin) {
      if ( plugin.before ) {
        docs = plugin.before(docs);
      }
    });

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
        docs = plugin.after(docs);
      }
    });

    return docs;
  };
};