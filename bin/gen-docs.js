#!/usr/bin/env node
var rimraf = require('rimraf');
var myArgs = require('optimist')
  .usage('Usage: $0 path/to/config')
  .demand(1)
  .argv;

var dgeni = require('../lib/index');
var log = dgeni.log;

// Set up logging to look nice on the command line
log.cli();

// Load in the config file and run it over the top of the default config
var config = dgeni.loadConfig(myArgs._[0]);

var outputFolder = config.get('rendering.outputFolder');
if ( config.get('rendering.cleanOutputFolder') && outputFolder ) {
  // Delete the previous output
  rimraf.sync(outputFolder);
  log.info('Removed previous output files from "' + outputFolder + '"');
}

var generateDocs = dgeni.generator(config);

generateDocs().then(function() {
  log.info('Finished generating docs');
}).done();