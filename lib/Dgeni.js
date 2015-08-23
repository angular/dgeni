var _ = require('lodash');
var di = require('di');
var Package = require('./Package');
var sortByDependency = require('./util/dependency-sort');
var Q = require('q');
var validationPackage = require('./legacyPackages/processorValidation');

/**
 * Create an instance of the Dgeni documentation generator, loading any packages passed in as a
 * parameter.
 * @param {Package[]} [packages] A collection of packages to load
 */
function Dgeni(packages) {
  this.packages = {};

  packages = packages || [];
  if ( !Array.isArray(packages) ) { throw new Error('packages must be an array'); }

  // Add in the legacy validation that was originally part of the core Dgeni tool.
  this.package(validationPackage);

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

  if ( this.injector) { throw new Error('injector already configured - you cannot add a new package'); }

  if ( typeof package === 'string' ) { package = new Package(package, dependencies); }
  if ( !(Package.isPackage(package)) ) { throw new Error('package must be an instance of Package'); }
  if ( this.packages[package.name] ) {
    throw new Error('The "' + package.name + '" package has already been loaded');
  }
  this.packages[package.name] = package;

  // Extract all inline packages and load them into dgeni;
  package.namedDependencies = package.dependencies.map(function(dependency) {
    if ( Package.isPackage(dependency) ) {
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

  var dgeni = this;

  if ( !dgeni.injector ) {

    // Sort the packages by their dependency - ensures that services and configs are loaded in the
    // correct order
    var packages = dgeni.packages = sortByDependency(dgeni.packages, 'namedDependencies');

    // Create a module containing basic shared services
    dgeni.stopOnProcessingError = true;
    var dgeniModule = new di.Module()
      .value('dgeni', dgeni)
      .factory('log', require('./util/log'))
      .factory('getInjectables', require('./util/getInjectables'));

    // Create the dependency injection container, from all the packages' modules
    var modules = packages.map(function(package) { return package.module; });
    modules.unshift(dgeniModule);

    // Create the injector and
    var injector = dgeni.injector = new di.Injector(modules);

    // Apply the config blocks
    packages.forEach(function(package) {
      package.configFns.forEach(function(configFn) {
        injector.invoke(configFn);
      });
    });

    // Get the the processors and event handlers
    var processorMap = {};
    dgeni.handlerMap = {};
    packages.forEach(function(package) {

      package.processors.forEach(function(processorName) {
        var processor = injector.get(processorName);
        // Update the processor's name and package
        processor.name = processorName;
        processor.$package = package.name;

        // Ignore disabled processors
        if ( processor.$enabled !== false ) {
          processorMap[processorName] = processor;
        }
      });

      for(eventName in package.handlers) {
        var handlers = dgeni.handlerMap[eventName] = (dgeni.handlerMap[eventName] || []);
        package.handlers[eventName].forEach(function(handlerName) {
          handlers.push(injector.get(handlerName));
        });
      }
    });

    // Once we have configured everything sort the processors.
    // This allows the config blocks to modify the $runBefore and $runAfter properties of processors.
    // (Crazy idea, I know, but useful for things like debugDumpProcessor)
    dgeni.processors = sortByDependency(processorMap, '$runAfter', '$runBefore');
  }

  return dgeni.injector;
};

/**
 * Generate the documentation using the loaded packages
 * @return {Promise} A promise to the generated documents
 */
Dgeni.prototype.generate = function() {
  var dgeni = this;
  var injector = this.configureInjector();
  var log = injector.get('log');

  var processingPromise = this.triggerEvent('generationStart');

  // Process the docs
  var currentDocs = [];
  processingPromise = processingPromise.then(function() {
    return currentDocs;
  });

  _.forEach(this.processors, function(processor) {

    if( processor.$process ) {

      processingPromise = processingPromise.then(function(docs) {
        currentDocs = docs;
        log.info('running processor:', processor.name);

        return Q(currentDocs).then(function() {
          // We need to wrap this $process call in a new promise handler so that we can catch
          // errors triggered by exceptions thrown in the $process method
          // before they reach the processingPromise handlers
          return processor.$process(docs) || docs;
        }).catch(function(error) {

          error.message = 'Error running processor "' + processor.name + '":\n' + error.message;
          if ( error.stack ) {
            log.error(error.stack);
          }

          if ( dgeni.stopOnProcessingError ) { return Q.reject(error); }

          return currentDocs;
        });
      });

    }

    return currentDocs;
  });

  processingPromise.catch(function(error) {
    log.error('Error processing docs: ', error );
  });

  return processingPromise;
};

/**
 * Trigger a dgeni event and run all the registered handlers
 * All the arguments to this call are passed through to each handler
 * @param  {string} eventName The event being triggered
 * @return {Promise} A promise to an array of the results from each of the handlers
 */
Dgeni.prototype.triggerEvent = function(eventName) {
  var args = arguments;
  var handlers = this.handlerMap[eventName];
  var handlersPromise = Q();
  var results = [];
  if (handlers) {
    handlers.forEach(function(handler) {
      handlersPromise = handlersPromise.then(function() {
        var handlerPromise = Q(handler.apply(null, args));
        handlerPromise.then(function(result) {
          results.push(result);
        });
        return handlerPromise;
      });
    });
  }
  return handlersPromise.then(function() {
    return results;
  });
};


Dgeni.prototype.info = function() {
  var injector = this.configureInjector();
  var log = injector.get('log');

  this.packages.forEach(function(pkg, index) {
    log.info((index+1) + ': ' + pkg.name, '[' + pkg.dependencies.map(function(dep) { return JSON.stringify(dep.name); }).join(', ') + ']');
  });

  log.info('== Processors (processing order) ==');

  this.processors.forEach(function(processor, index) {
    log.info((index+1) + ': ' + processor.name, processor.$process ? '' : '(abstract)', ' from ', processor.$package);
    if ( processor.description ) { log.info('   ', processor.description); }
  });
}


/**
 * @module Dgeni
 */
module.exports = Dgeni;
