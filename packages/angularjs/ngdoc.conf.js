var _ = require('lodash');

module.exports = function(defaultConfig) {
  var config = {
    source: {
      files: [
        { pattern: '../../example/src/**/*.js', basePath: '../../example' },
        { pattern: '../../example/content/**/*.ngdoc', basePath: '../../example/content' }
      ],
      extractors: require('./extractors')
    },

    processing: {
      tagParser: require('../default/processors/doctrine-tag-parser'),
      plugins: require('./processors'),
      tagDefinitions: require('./tag-defs')
    },

    rendering: {
      templatePath: 'rendering/templates',
      templateExtension: 'templates.html',
      templateFinderFactory: require('./rendering/template-finder'),
      filters: require('./rendering/filters'),
      tags: require('./rendering/tags'),
      outputPath: 'build',
      extra: {
        git: {
          tag: "v1.2.6-build.1989+sha.b0474cb"
        }
      }
    }
  };

  return _.defaults(config, defaultConfig);
};