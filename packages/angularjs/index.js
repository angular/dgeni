var _ = require('lodash');
var path = require('canonical-path');
var packagePath = __dirname;

module.exports = function(defaultConfig) {
  var config = {
    source: {
      extractors: require('./extractors')
    },

    processing: {
      tagDefinitions: require('./tag-defs'),
      processors: require('./processors')
    },

    rendering: {
      templateFolder: path.resolve(packagePath, 'rendering/templates'),
      templatePatterns: [
        '${ doc.template }',
        '${ doc.id }.${ doc.docType }.template.html',
        '${ doc.id }.template.html',
        '${ doc.docType }.template.html'
      ],
      filters: require('./rendering/filters'),
      tags: require('./rendering/tags')
    }
  };

  return _.defaults(config, defaultConfig);
};