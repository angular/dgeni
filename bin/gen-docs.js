#!/usr/bin/env node
var log = require('winston');
var rimraf = require('rimraf');
var myArgs = require('optimist')
  .usage('Usage: $0 path/to/config')
  .demand(1)
  .argv;
var configurer = require('../lib/utils/config');
var docGenerator = require('../lib/index');

log.cli();

// Load in the config file and run it over the top of the default config
var config = configurer.load(myArgs._[0]);

log.level = config.logging.level;
log.info('Read config from "' + myArgs._[0] + '"');
log.info('Logging set to "' + log.level + '"');
log.debug('basePath: ', config.basePath);



// Delete the previous output folder
if ( config.rendering.cleanOutputFolder ) {
  rimraf.sync(config.rendering.outputFolder);
  log.info('Removed previous output files from "' + config.rendering.outputFolder + '"');
}

docGenerator(config).generateDocs().then(function() {
  log.info('Finished generating docs');
}).done();