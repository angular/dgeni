var _ = require('lodash');

module.exports = {
  name: 'paths',
  description: 'This plugin will compute the path to the route and the output file for the partial' +
               'that will be generated from the code name or original file path of the doc.',
  runAfter: ['parent'],
  runBefore: ['rendering-docs'],
  init: function(config, injectables) {
    injectables.value('partialFolder', (config && config.rendering && config.rendering.partialFolder) || 'partials');
  },
  process: function(docs, partialFolder) {
    _.forEach(docs, function(doc) {
      var path = doc.pathSegment;
      var parentDoc = doc.parentDoc;
      while(parentDoc) {
        path = parentDoc.pathSegment + '/' + path;
        parentDoc = parentDoc.parentDoc;
      }
      doc.path = path;

      var hasKids = doc.childDocs && doc.childDocs.length > 0;

      // Strip off any hash fragment and add index.html if it has children
      doc.outputPath = partialFolder + '/' + path.split('#').shift() + (hasKids ? '/index.html' : '.html');

    });
  }
};