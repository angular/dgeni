#!/usr/bin/env node
var path = require('canonical-path');
var _ = require('lodash');
var log = require('winston');
var rimraf = require('rimraf');
var myArgs = require('optimist')
  .usage('Usage: $0 path/to/config')
  .demand(1)
  .argv;
var loadConfig = require('../lib/utils/config');
var docGenerator = require('../lib/index');

log.cli();
log.level = 'debug';

// Default configuration
var defaultConfig = {
  source: {
    files : [],
    extractors: []
  },

  processing: {
    tagParser: null,
    plugins: [],
    tagDefinitions: []
  },

  rendering: {
    templateFinder: function(config) {
      return function findTemplate(doc) {
        return config.rendering.templateFolder + doc.docType + '.' + config.rendering.templateExtension;
      };
    },
    templatePath: './templates',
    filters: [],
    tags: [],
    extra: {},
    outputPath: './build'
  }
};


// Load in the config file and run it over the top of the default config
var config = loadConfig(path.resolve(myArgs._[0]), defaultConfig);

log.info('Read config from "' + myArgs._[0] + '"');
log.info('Logging set to "' + log.level + '"');

log.info('basePath: ', config.basePath);
// Normalize the paths in the config file
var normalizePath = function(filePath) {
  var normalisedPath = path.resolve(config.basePath, filePath);
  log.debug('normalizing: ', filePath, normalisedPath);
  return normalisedPath;
};
config.source.files = _.map(config.source.files, function(file) {
  if ( _.isString(file) ) { return normalizePath(file); }
  if ( _.isObject(file) ) {
    return {
      pattern: normalizePath(file.pattern),
      basePath: normalizePath(file.basePath)
    };
  }
  return file;
});
config.rendering.templatePath = normalizePath(config.rendering.templatePath);
config.rendering.outputPath = normalizePath(config.rendering.outputPath);


// Delete the previous output folder
rimraf.sync(config.rendering.outputPath);
log.info('Removed previous output files from "' + config.rendering.outputPath + '"');

docGenerator(config).generateDocs().then(function() {
  log.info('Finished generating docs');
}).done();