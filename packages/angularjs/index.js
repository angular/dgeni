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
    },

    deployment: {
      environments: [{
        name: 'debug',
        scripts: [
          'angular.js',
          'angular-resource.js',
          'angular-route.js',
          'angular-cookies.js',
          'angular-sanitize.js',
          'angular-touch.js',
          'angular-animate.js',
          'components/angular-bootstrap.js',
          'components/angular-bootstrap-prettify.js',
          'components/google-code-prettify.js',
          'components/lunr.js',
          'components/marked.js',
          'docs-data.js',
          'js/docs.js'
        ],
        stylesheets: [
          'components/bootstrap/css/bootstrap.css',
          'components/font-awesome/css/font-awesome.css',
          'css/prettify.css',
          'css/docs.css',
          'css/animations.css'
        ]
      }]
    }
  };

  return _.defaults(config, defaultConfig);
};