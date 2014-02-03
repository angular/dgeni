var _ = require('lodash');
var path = require('canonical-path');
var packagePath = __dirname;

var basePackage = require('../packages/docs.angularjs.org');

module.exports = function(config) {

  config = basePackage(config);

  config.set('source.files', [
    { pattern: 'src/**/*.js', basePath: path.resolve(packagePath) },
    { pattern: '**/*.ngdoc', basePath: path.resolve(packagePath, 'content') }
  ]);

  config.set('rendering.outputFolder', 'build');
  config.set('rendering.cleanOutputFolder', true);

  config.set('logging.level', 'info');

  config.merge('deployment', {
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
        'components/marked/lib/marked.js',
        'js/angular-bootstrap/bootstrap.js',
        'js/angular-bootstrap/bootstrap-prettify.js',
        'components/lunr.js/lunr.js',
        'components/google-code-prettify/src/prettify.js',
        'components/google-code-prettify/src/lang-css.js',
        'js/versions-data.js',
        'js/pages-data.js',
        'js/docs.js'
      ],
      stylesheets: [
        'css/bootstrap/css/bootstrap.css',
        'components/open-sans-fontface/open-sans.css',
        'css/prettify-theme.css',
        'css/docs.css',
        'css/animations.css'
      ]
    }]
  });

  return config;
};
