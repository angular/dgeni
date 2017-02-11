#!/usr/bin/env node
import {Dgeni} from './Dgeni';

const path = require('canonical-path');
const myArgs = require('optimist')
  .usage('Usage: $0 path/to/mainPackage [path/to/other/packages ...] [--log level]')
  .demand(1)
  .argv;


// Extract the paths to the packages from the command line arguments
const packagePaths = myArgs._;

// Require each of these packages and then create a new dgeni using them
const packages = packagePaths.map((packagePath) => {
  if ( packagePath.indexOf('.') === 0 ) {
    packagePath = path.resolve(packagePath);
  }
  return require(packagePath);
});

const logLevel = myArgs.log || myArgs.l;
if ( logLevel ) {
  // Add CLI package (to override settings from other packages)
  packages.push(new Dgeni.Package('cli-package').config((log) => {
    // override log settings
    log.level = logLevel;
  }));
}

const dgeni = new Dgeni(packages);

// Run the document generation
dgeni.generate().then(() => {
  console.log('Finished generating docs');
}).done();
