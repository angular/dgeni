#!/usr/bin/env node
import {Dgeni} from './Dgeni';
import {register, Options} from 'ts-node';

const path = require('canonical-path');
const myArgs = require('optimist')
  .usage('Usage: $0 path/to/mainPackage [path/to/other/packages ...] [--log level] [--project]')
  .demand(1)
  .argv;


// Extract the paths to the packages from the command line arguments
const packagePaths: string[] = myArgs._;

const containsTypeScript = packagePaths.some(packagePath => packagePath.endsWith('.ts'));
// In case a package is a TypeScript file, transpile it before hand
if ( containsTypeScript ) {
  let typeScriptOptions: Partial<Options> = {};
  if ( myArgs.project ) {
    typeScriptOptions.project = myArgs.project;
  } else {
    typeScriptOptions.transpileOnly = true;
  }
  register(typeScriptOptions);
}

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
