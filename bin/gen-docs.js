#!/usr/bin/env node
var path = require('canonical-path');
var myArgs = require('optimist')
  .usage('Usage: $0 path/to/mainPackage [path/to/other/packages ...] [--log level]')
  .demand(1)
  .argv;

var Dgeni = require('dgeni');
var Package = require('dgeni').Package;

// Extract the paths to the packages from the command line arguments
var packagePaths = myArgs._;

// Require each of these packages and then create a new dgeni using them
var packages = packagePaths.map(function(packagePath) {
  if ( packagePath.indexOf('.') === 0 ) {
    packagePath = path.resolve(packagePath);
  }
  return require(packagePath);
});

// Add CLI package (opt-in to override settings from other packages)
packages.push(new Package('cli-package', [
  require('dgeni-packages/base')
]).config(function(log) {
    // override log settings
    var logLevel = myArgs.log || myArgs.l;
    if ( logLevel ) {
      log.level = logLevel;
    }
}));

var dgeni = new Dgeni(packages);

// Run the document generation
dgeni.generate().then(function() {
  console.log('Finished generating docs');
}).done();
