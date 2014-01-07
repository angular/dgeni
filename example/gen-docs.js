#!/usr/bin/env node

var vm = require('vm');
var fs = require('fs');
var _ = require('lodash');
var log = require('winston');
var rimraf = require('rimraf');
log.cli();

var myArgs = require('optimist')
  .usage('Usage: $0 path/to/config')
  .demand(1)
  .argv;

// Load in the factories
var fileReaderFactory = require('../lib/doc-extractor');
var docProcessorFactory = require('../lib/doc-processor');
var docRendererFactory = require('../lib/doc-renderer');


// Default configuration
var config = {
  source: {
    files: [],
    extractors: require('../lib/doc-extractor/doc-extractors')
  },

  processing: {
    plugins: require('../lib/doc-processor/plugins'),
    tagDefinitions: require('../lib/doc-processor/tag-defs')
  },

  rendering: {
    templatePath: '',
    filters: require('../lib/doc-renderer/custom-filters'),
    tags: require('../lib/doc-renderer/custom-tags'),
    extra: {},
    outputPath: ''
  },

  logging: {
    level: 'warning',
    colorize: true
  }
};

// Load in the config file and run it over the top of the default config
var configFile = fs.readFileSync(myArgs._[0]);
vm.runInNewContext(configFile, config, myArgs._[0]);

log.cli();
log.remove(log.transports.Console);
log.add(log.transports.Console, config.logging);
log.info('Read config from "' + myArgs._[0] + '"');


// Create the processing functions from the factories and the configuration
var readFiles = fileReaderFactory(config.source.extractors);
var processDocs = docProcessorFactory(config.processing.plugins, config.processing.tagDefinitions);
var renderDocs = docRendererFactory(config.rendering.templatePath, config.rendering.outputPath, config.rendering.filters, config.rendering.tags);

// Delete the previous output folder
rimraf.sync(config.rendering.outputPath);
log.info('Removed previous output files from "' + config.rendering.outputPath + '"');

// Run the processing functions
readFiles(config.source.files)

  .then(function(docs) {
    log.info('Read', docs.length, 'docs');
    docs = processDocs(docs);
    return renderDocs(docs, config.rendering.extra);
  })

  .done();