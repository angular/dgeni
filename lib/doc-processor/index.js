var _ = require('lodash');

/**
 * Build a function to process the documents by running the given plugins
 * @param  {function} plugins The plugins to apply to the docs
 * @return {function}         The function that will process the docs
 */
module.exports = function docParserFactory(plugins) {
  /**
   * Process the docs
   * @param  {array} docs Collection of docs to process
   * @return {array}      The processed docs
   */
  return function(docs) {
    _.forEach(plugins,function(plugin) {
      docs = plugin(docs);
    });
    return docs;
  };
};