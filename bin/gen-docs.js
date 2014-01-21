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

// Default configuration
var defaultConfig = {
  source: {
    files : [],
    extractors: []
  },

  processing: {
    tagParser: null,
    processors: [],
    tagDefinitions: []
  },

  rendering: {
    templateFolder: './templates',
    filters: [],
    tags: [],
    extra: {},
    outputPath: './build'
  },

  logging: {
    level: 'info'
  }
};


// Load in the config file and run it over the top of the default config
var config = loadConfig(path.resolve(myArgs._[0]), defaultConfig);

log.level = config.logging.level;
log.info('Read config from "' + myArgs._[0] + '"');
log.info('Logging set to "' + log.level + '"');

if ( !config.basePath ) {
  // If the config does not have a base path then set it to the same folder as the config file
  config.basePath = path.resolve(path.dirname(myArgs._[0]));
}

log.debug('basePath: ', config.basePath);

config.source.files = _.map(config.source.files, function(file) {
  if ( _.isString(file) ) {
    return {
      pattern: path.resolve(config.basePath, file),
      basePath: config.basePath
    };
  } else if ( _.isObject(file) ) {
    return {
      pattern: path.resolve(config.basePath, file.basePath, file.pattern),
      basePath: path.resolve(config.basePath, file.basePath)
    };
  }
  return file;
});

config.rendering.templateFolder = path.resolve(config.basePath, config.rendering.templateFolder);
config.rendering.outputPath = path.resolve(config.basePath, config.rendering.outputPath);


// Delete the previous output folder
rimraf.sync(config.rendering.outputPath);
log.info('Removed previous output files from "' + config.rendering.outputPath + '"');

docGenerator(config).generateDocs().then(function() {
  log.info('Finished generating docs');
}).done();