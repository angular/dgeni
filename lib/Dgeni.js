var _ = require('lodash');
var di = require('di');
var Package = require('./package');
var sortByDependency = require('./util/dependency-sort');
var validate = require('validate.js');
var Q = require('q');

function Dgeni(packages) {
  this.stopOnValidationError = true;
  this.stopOnProcessingError = true;
  this.packages = {};
  _.forEach(packages, function(package) {
    this.package(package);
  }, this);
}
Dgeni.Package = Package;

Dgeni.prototype.package = function(package, dependencies) {
  if ( _.isString(package) ) { package = new Package(package, dependencies); }
  if ( !(package instanceof Package) ) { throw new Error('package must be an instance of Package'); }
  if ( this.packages[package.name] ) {
    throw new Error('The "' + package.name + '" package has already been loaded');
  }
  this.packages[package.name] = package;
  return package;
};

Dgeni.prototype.generate = function() {

  var dgeni = this;

  // Sort the packages by their dependency - ensures that services and configs are loaded in the
  // correct order
  var packages = sortByDependency(this.packages, 'dependencies');

  // Create a module containing basic shared services
  var injector;
  var dgeniModule = new di.Module()
    .value('dgeni', this)
    .value('log', require('./util/log'));

  // Create the dependency injection container, from all the packages' modules
  var modules = [dgeniModule].concat(_.map(packages, 'module'));
  injector = new di.Injector(modules);


  // Get the collection of processors
  var processors = [];
  _.forEach(packages, function(package) {
    _.forEach(package.processors, function(processorName) {
      var processor = injector.get(processorName);
      processor.name = processorName;
      processors.push(processor);
    });
  });
  processors = sortByDependency(processors, '$runAfter', '$runBefore');


  // Apply the config blocks
  _.forEach(packages, function(package) {
    _.forEach(package.configFns, function(configFn) {
      config = injector.invoke(configFn);
    });
  });

  var processingPromise = Q(currentDocs);

  // Apply the validations on each processor
  _.forEach(processors, function(processor) {
    processingPromise = processingPromise.then(function() {
      return validate.async(processor, processor.$validate);
    }).catch(function(errors) {
      log.error('Invalid Processor Configuration: ' + processor.name);
      log.error(errors);
      if ( dgeni.stopOnValidationError ) { return Q.reject(errors); }
    });
  });


  // Process the docs
  var log = injector.get('log');
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
        if ( dgeni.stopOnProcessingError ) { throw error; }
        return currentDocs;

      });

    }
  });

  processingPromise.catch(function(error) {
    log.error('Error processing docs:\n' + error.stack);
  });

  return processingPromise;
};

module.exports = Dgeni;
