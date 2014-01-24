var _ = require('lodash');
var path = require('canonical-path');
var packagePath = __dirname;

var angularjsPackage = require('../packages/angularjs');

module.exports = function(config) {
  
  config = angularjsPackage(config);
  
  config.source.files = [
    'src/**/*.js',
    { pattern: '**/*.ngdoc', basePath: 'content' }
  ];

  //config.processing.dumpToFile = 'docs.txt';

  config.rendering.templateFolders.unshift(path.resolve(packagePath, 'templates'));
  config.rendering.outputFolder = 'build';
  config.rendering.cleanOutputFolder = true;
  config.rendering.extra = {
    git: {
      tag: "v1.2.6-build.1989+sha.b0474cb"
    }
  };

  config.logging.level = 'info';
  

  config.deployment = {
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
        //'js/google-code-prettify.js',
        'components/lunr.js/lunr.js',
        'js/docs-data.js',
        'js/docs.js'
      ],
      stylesheets: [
        'components/bootstrap/css/bootstrap.css',
        'components/font-awesome/css/font-awesome.css',
        //'css/prettify.css',
        'css/docs.css',
        'css/animations.css'
      ]
    }]
  };

  return config;
};