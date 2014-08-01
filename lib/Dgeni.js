var di = require('di');
var Package = require('./package');
var sortByDependency = require('./util/dependency-sort');
var validate = require('validate.js');
var Q = require('q');
require('es6-shim');

/**
 * Create an instance of the Dgeni documentation generator, loading any packages passed in as a
 * parameter.
 * @param {Package[]} [packages] A collection of packages to load
 */
function Dgeni(packages) {
  this.packages = new Map();

  packages = packages || [];
  if ( !Array.isArray(packages) ) { throw new Error('packages must be an array'); }
  packages.map(this.package, this);
}

/**
 * @type {Package}
 */
Dgeni.Package = Package;

/**
 * Load a package into dgeni
 * @param  {Package|string} package              The package to load or the name of a new package to
 *                                               create.
 * @param  {Array.<Package|string>} dependencies A collection of dependencies for this package
 * @return {Package}                             The package that was loaded, to allow chaining
 */
Dgeni.prototype.package = function(package, dependencies) {

  if ( typeof package === 'string' ) { package = new Package(package, dependencies); }
  if ( !(package instanceof Package) ) { throw new Error('package must be an instance of Package'); }
  if ( this.packages.has(package.name) ) {
    throw new Error('The "' + package.name + '" package has already been loaded');
  }
  this.packages.set(package.name, package);

  // Extract all inline packages and load them into dgeni;
  package.namedDependencies = package.dependencies.map(function(dependency) {
    if ( dependency instanceof Package ) {
      // Only load dependent package if not already loaded
      if ( !this.packages.has(dependency.name) ) { this.package(dependency); }
      return dependency.name;
    }
    return dependency;
  }, this);

  // Return the package to allow chaining
  return package;
};

/**
 * Generate the documentation using the loaded packages
 * @return {Promise} A promise to the generated documents
 */
Dgeni.prototype.generate = function() {

  // Sort the packages by their dependency - ensures that services and configs are loaded in the
  // correct order
  var packages = sortByDependency(this.packages, 'namedDependencies');

  // Create a module containing basic shared services
  var injector;
  var dgeniConfig = {
    stopOnValidationError: true,
    stopOnProcessingError: true
  };
  var dgeniModule = new di.Module()
    .value('dgeni', dgeniConfig)
    .factory('log', require('./util/log'))
    .factory('getInjectables', require('./util/getInjectables'));

  // Create the dependency injection container, from all the packages' modules
  var modules = packages.map(function(package) { return package.module; });
  modules.unshift(dgeniModule);
  injector = new di.Injector(modules);


  // Apply the config blocks
  packages.forEach(function(package) {
    package.configFns.forEach(function(configFn) {
      injector.invoke(configFn);
    });
  });


  // Get the collection of processors
  // We use a Map here so that we only get one of each processor name
  var processors = new Map();
  packages.forEach(function(package) {
    package.processors.forEach(function(processorName) {
      var processor = injector.get(processorName);
      processor.name = processorName;
      processor.$package = package.name;

      // Ignore disabled processors
      if ( processor.$enabled !== false ) {
        processors.set(processorName, processor);
      }
    });
  });

  // Once we have configured everything sort the processors.
  // This allows the config blocks to modify the $runBefore and $runAfter
  // properties of processors.
  // (Crazy idea, I know, but useful for things like debugDumpProcessor)
  processors = sortByDependency(processors, '$runAfter', '$runBefore');

  var log = injector.get('log');
  var processingPromise = Q();

  // Apply the validations on each processor
  processors.forEach(function(processor) {
    processingPromise = processingPromise.then(function() {
      return validate.async(processor, processor.$validate);
    }).catch(function(errors) {
      log.error('Invalid Processor Configuration: ' + processor.name + ' (in "' + processor.$package + '" package)');
      log.error(errors);
      if ( dgeniConfig.stopOnValidationError ) { return Q.reject(errors); }
    });
  });


  // Process the docs
  var currentDocs = [];
  processingPromise = processingPromise.then(function() {
    return currentDocs;
  });

  processors.forEach(function(processor) {

    if( processor.$process ) {

      processingPromise = processingPromise.then(function(docs) {
        currentDocs = docs;
        log.info('running processor:', processor.name);
        return processor.$process(docs) || docs;

      }).catch(function(error) {

        error.message = 'Error running processor "' + processor.name + '":\n' + error.message;
        log.error(error.stack);
        if ( dgeniConfig.stopOnProcessingError ) { throw error; }
        return currentDocs;

      });

    }
  });

  processingPromise.catch(function(error) {
    log.error('Error processing docs:\n' + error.stack);
  });

  return processingPromise;
};

/**
 * @module Dgeni
 */
module.exports = Dgeni;
