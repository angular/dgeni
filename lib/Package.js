var Module = require('di').Module;
var _ = require('lodash');

function Package(name, dependencies) {
  this.name = name;
  this.dependencies = dependencies || [];
  this.processors = [];
  this.configFns = [];
  this.module = new Module();
}

Package.prototype.processor = function(name, processorFactory) {

  if (!_.isString(name) ) { throw new Error('processor name must be a string'); }
  if (!_.isFunction(processorFactory) ) { throw new Error('processor factory must be a function'); }

  this.processors.push(name);
  this.module.factory(name, processorFactory);
  return this;
};

Package.prototype.factory = function(name, serviceFactory) {
  if (!_.isString(name) ) { throw new Error('service name must be a string'); }
  if (!_.isFunction(serviceFactory) ) { throw new Error('service factory must be a function'); }

  this.module.factory(name, serviceFactory);
  return this;
};

Package.prototype.type = function(name, ServiceType) {
  if (!_.isString(name) ) { throw new Error('service name must be a string'); }
  if (!_.isFunction(ServiceType) ) { throw new Error('service type must be a constructor function'); }

  this.module.type(name, ServiceType);
  return this;
};

Package.prototype.config = function(configFn) {
  this.configFns.push(configFn);
  return this;
};

module.exports = Package;