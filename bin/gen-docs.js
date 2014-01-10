#!/usr/bin/env node

var _ = require('lodash');
var logger = require('winston');
var rimraf = require('rimraf');
var myArgs = require('optimist')
  .usage('Usage: $0 path/to/config')
  .demand(1)
  .argv;
var loadConfig = require('../lib/utils/config');
var docGenerator = require('../lib/index');

logger.cli();
logger.level = 'warning';

// Default configuration
var defaultConfig = {
  source: {
    files: [],
    extractors: []
  },

  processing: {
    plugins: [],
    tagDefinitions: []
  },

  rendering: {
    templateFinder: function(templateFolder, ext) {
      return function(doc) { return templateFolder + doc.docType + '.' + ext; };
    },
    templatePath: '',
    filters: [],
    tags: [],
    extra: {},
    outputPath: ''
  },

  logger: logger
};

// Load in the config file and run it over the top of the default config
var config = loadConfig(myArgs._[0], defaultConfig);

log.info('Read config from "' + myArgs._[0] + '"');
log.info('Logging set to "' + log.level + '"');

// Delete the previous output folder
rimraf.sync(config.rendering.outputPath);
log.info('Removed previous output files from "' + config.rendering.outputPath + '"');

docGenerator.generateDocs(config).then(function() {
  log.info('Finished generating docs');
}).done();