var angularjsPackage = require('../packages/angularjs');

module.exports = function(config) {
  
  config = angularjsPackage(config);
  
  config.source.files = [
    'src/**/*.js',
    { pattern: '**/*.ngdoc', basePath: 'content' }
  ];

  config.processing.dumpToFile = 'docs.txt';

  config.rendering.outputPath = 'build';
  config.rendering.extra = {
    git: {
      tag: "v1.2.6-build.1989+sha.b0474cb"
    }
  };

  return config;
};