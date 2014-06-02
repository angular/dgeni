function Package(name, dependencies) {
  this.name = name;
  this.dependencies = dependencies || [];
  this.processors = [];
  this.serviceFactories = {};
  this.configFns = [];
}

Package.prototype.processor = function(processorDef) {
  this.processors.push(processorDef);
  return this;
};

Package.prototype.service = function(serviceName, serviceFactory) {
  this.serviceFactories[serviceName] = serviceFactory;
  return this;
};

Package.prototype.config = function(configFn) {
  this.configFns.push(configFn);
  return this;
};

module.exports = Package;