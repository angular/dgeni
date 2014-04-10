var _ = require('lodash');
var path = require('canonical-path');
var dgeni = require('../lib');
var jsdocPackage = require('dgeni-packages/jsdoc');

var basePath = path.resolve(__dirname);

module.exports = function(config) {
  config = jsdocPackage(config);

  config.set('source.projectPath', basePath);

  config.set('source.files', [
    { pattern: '../lib/**/*.js', basePath: basePath }
  ]);

  config.set('processing.stopOnError', true);
  config.set('rendering.outputFolder', 'build');
  config.set('rendering.contentsFolder', 'docs');

  config.set('logging.level', 'debug');

  return config;
};