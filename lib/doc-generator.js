var _ = require('lodash');
var log = require('winston');
var Config = require('./config');
var docProcessorFactory = require('./doc-processor');
var Package = require('./package');
var sortByDependency = require('./util/dependency-sort');

function DocGenerator(packages) {
  this.packages = {};
  _.forEach(packages, function(package) {
    this.package(package);
  }, this);
}

DocGenerator.prototype.package = function(package, dependencies) {
  if ( _.isString(package) ) { package = new Package(package, dependencies); }
  if ( !(package instanceof Package) ) { throw new Error('package must be an instance of Package'); }
  if ( this.packages[package.name] ) {
    throw new Error('The "' + package.name + '" package has already been loaded');
  }
  this.packages[package.name] = package;
  return package;
};

DocGenerator.prototype.generate = function() {

  // Extract processors, serviceFactories and config from packages
  var packages = sortByDependency(this.packages, 'dependencies');

  var processors = [];
  var serviceFactories = {};
  var config = new Config();

  _.forEach(packages, function(package) {
    _.assign(serviceFactories, package.serviceFactories);
  });

  _.forEach(packages, function(package) {
    processors = processors.concat(package.processors);
  });
  processors = sortByDependency(processors, 'runAfter', 'runBefore');

  // Apply the default config values from each processor
  _.forEach(processors, function(processor) {
    applyDefaults(config, processor);
  });

  _.forEach(packages, function(package) {
    _.forEach(package.configFns, function(configFn) {
      config = configFn(config) || config;
    });
  });

  // Apply the validators on the config value from each processor
  _.forEach(processors, function(processor) {
    applyValidators(config, processor);
  });


  // Setup logging
  log.cli();
  log.level = config.get('logging.level', 'info');

  // Process the docs
  var processDocs = docProcessorFactory(processors, serviceFactories, config);
  log.info('Processing docs');
  return processDocs().then(function(docs) {
    log.info('Processed', docs.length, 'docs');
  });
};

module.exports = DocGenerator;

function applyDefaults(config, processor) {
  _.forEach(processor.config, function(configItem, propertyPath) {
    var processorConfig = new Config(config, processor.name);
    if ( configItem.default ) {
      processorConfig.set(propertyPath, configItem.default);
    }
  });
}

function applyValidators(config, processor) {
  _.forEach(processor.config, function(configItem, propertyPath) {
    var processorConfig = new Config(config, processor.name);
    if ( configItem.validate ) {
      var configValue = processorConfig.get(propertyPath);
      try {
        configItem.validate(configValue, config, processor);
      } catch (x) {
        var error = new Error(x);
        error.processor = processor;
        error.configProperty = propertyPath;
        error.configValue = configValue;
        error.errorMessage = x.message;
        error.message = 'Invalid config property:\n' +
          ' - processor: ' + processor.name + '\n' +
          ' - property: ' + propertyPath + '\n' +
          ' - value: ' + configValue + '\n' +
          ' - message: ' + x.message + '\n';
        throw error;
      }
    }
  });
}