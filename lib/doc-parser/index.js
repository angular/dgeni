var _ = require('lodash');

module.exports = function docParserFactory(plugins) {
  return function(docs) {
    _.forEach(plugins,function(plugin) {
      docs = plugin(docs);
    });
    console.log('done', docs.length);
    return docs;
  };
};