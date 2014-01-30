var _ = require('lodash');
var path = require('canonical-path');
var fs = require('fs');
var gitInfo = require('../../lib/utils/git-info');
var packagePath = __dirname;

var angularjsPackage = require('../../packages/angularjs');

module.exports = function(config) {

  var nodePackage = JSON.parse(fs.readFileSync('package.json', 'UTF-8'));

  config = angularjsPackage(config);
  
  config.set('source.files', [
    { pattern: 'src/**/*.js', basePath: path.resolve(packagePath, '..') },
    { pattern: '**/*.ngdoc', basePath: path.resolve(packagePath, '../content') }
  ]);

  config.set('source.nodePackage', nodePackage);

  config.append('processing.processors', [
    require('./processors/keywords'),
    require('./processors/versions-data'),
    require('./processors/pages-data'),
    require('./processors/index-page')
  ]);

  config.processing.tagDefinitions.push(require('./tag-defs/tutorial-step'));

  config.set('processing.search.ignoreWordsFile', 'ignore.words');

  config.prepend('rendering.templateFolders', [
    path.resolve(packagePath, 'templates')
  ]);

  config.set('rendering.outputFolder', '../build');
  config.set('rendering.cleanOutputFolder', true);
  config.set('rendering.extra', {
    git: gitInfo.getGitInfo(nodePackage.repository.url),
    version: gitInfo.getCurrentVersion(nodePackage)
  });

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
        //'js/google-code-prettify.js',
        'components/lunr.js/lunr.js',
        'js/versions-data.js',
        'js/pages-data.js',
        'js/docs.js'
      ],
      stylesheets: [
        'css/bootstrap/css/bootstrap.css',
        'components/open-sans-fontface/open-sans.css',
        'css/prettify.css',
        'css/docs.css',
        'css/animations.css'
      ]
    }]
  });

  return config;
};
