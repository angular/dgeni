var _ = require('lodash');
var path = require('canonical-path');
var packagePath = __dirname;

module.exports = function(defaultConfig) {
  var config = {
    source: {
      extractors: require('./extractors')
    },

    processing: {
      plugins: require('./processors'),
      tagDefinitions: require('./tag-defs')
    },

    rendering: {
      templatePath: path.resolve(packagePath, 'rendering/templates'),
      templateExtension: 'templates.html',
      templateFinder: require('./rendering/template-finder'),
      filters: require('./rendering/filters'),
      tags: require('./rendering/tags')
    }
  };

  return _.defaults(config, defaultConfig);
};