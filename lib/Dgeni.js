var _ = require('lodash');
var di = require('di');
var Package = require('./Package');
var sortByDependency = require('./util/dependency-sort');
var validate = require('validate.js');
var Q = require('q');

/**
 * Create an instance of the Dgeni documentation generator, loading any packages passed in as a
 * parameter.
 * @param {Package[]} [packages] A collection of packages to load
 */
function Dgeni(packages) {
  this.packages = {};

  packages = packages || [];
  if ( !Array.isArray(packages) ) { throw new Error('packages must be an array'); }
  _.map(packages, this.package, this);
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
  if ( this.packages[package.name] ) {
    throw new Error('The "' + package.name + '" package has already been loaded');
  }
  this.packages[package.name] = package;

  // Extract all inline packages and load them into dgeni;
  package.namedDependencies = package.dependencies.map(function(dependency) {
    if ( dependency instanceof Package ) {
      // Only load dependent package if not already loaded
      if ( !this.packages[dependency.name] ) { this.package(dependency); }
      return dependency.name;
    }
    return dependency;
  }, this);

  // Return the package to allow chaining
  return package;
};

/**
 * Configure the injector using the loaded packages.
 *
 * The injector is assigned to the `injector` property on `this`, which is used by the
 * `generate()` method. Subsequent calls to this method will just return the same injector.
 *
 * This method is useful in unit testing services and processors as it gives an easy way to
 * get hold of an instance of a ready instantiated component without having to load in all
 * the potential dependencies manually:
 *
 * ```
 * var Dgeni = require('dgeni');
 *
 * function getInjector() {
 *   var dgeni = new Dgeni();
 *   dgeni.package('testPackage', [require('dgeni-packages/base')])
 *     .factory('templateEngine', function dummyTemplateEngine() {});
 *   return dgeni.configureInjector();
 * };
 *
 * describe('someService', function() {
 *   var someService;
 *   beforeEach(function() {
 *     var injector = getInjector();
 *     someService = injector.get('someService');
 *   });
 *
 *   it("should do something", function() {
 *     someService.doSomething();
 *     ...
 *   });
 * });
 * ```
 */
Dgeni.prototype.configureInjector = function() {

  if ( !this.injector ) {

    // Sort the packages by their dependency - ensures that services and configs are loaded in the
    // correct order
    var packages = sortByDependency(this.packages, 'namedDependencies');

    // Create a module containing basic shared services
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

    // Create the injector and
    var injector = this.injector = new di.Injector(modules);


    // Apply the config blocks
    packages.forEach(function(package) {
      package.configFns.forEach(function(configFn) {
        injector.invoke(configFn);
      });
    });

    // Get the collection of processors
    // We use a Map here so that we only get one of each processor name
    var processors = this.processors = {};
    packages.forEach(function(package) {
      package.processors.forEach(function(processorName) {
        var processor = injector.get(processorName);
        processor.name = processorName;
        processor.$package = package.name;

        // Ignore disabled processors
        if ( processor.$enabled !== false ) {
          processors[processorName] = processor;
        }
      });
    });
  }

  return this.injector;
};

/**
 * Generate the documentation using the loaded packages
 * @return {Promise} A promise to the generated documents
 */
Dgeni.prototype.generate = function() {

  this.configureInjector();

  var dgeniConfig = this.injector.get('dgeni');

  // Once we have configured everything sort the processors.
  // This allows the config blocks to modify the $runBefore and $runAfter
  // properties of processors.
  // (Crazy idea, I know, but useful for things like debugDumpProcessor)
  processors = sortByDependency(this.processors, '$runAfter', '$runBefore');

  var log = this.injector.get('log');
  var processingPromise = Q();

  // Apply the validations on each processor
  _.forEach(processors, function(processor) {
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

  _.forEach(processors, function(processor) {

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
