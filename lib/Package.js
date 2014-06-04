var Module = require('di').Module;

/**
 * A Dgeni Package containing processors, services and config blocks.
 * @param {string}   name         The name of the package
 * @param {string[]} dependencies The names of packages (or the actual packages) that this package
 *                                depends upon
 */
function Package(name, dependencies) {
  if ( typeof name !== 'string' ) { throw new Error('You must provide a name for the package'); }
  if ( dependencies && !Array.isArray(dependencies) ) { throw new Error('dependencies must be an array'); }
  this.name = name;
  this.dependencies = dependencies || [];
  this.processors = [];
  this.configFns = [];
  this.module = new Module();
}

/**
 * Add a new processor to the package
 * @param  {function} processorFactory The factory function that will be used by the injector to
 *                                     create the processor.  The function must not be anonymous -
 *                                     it must have a name, e.g. `function myProcessor() { ... }` -
 *                                     since the name of the processor is taken from the name of the
 *                                     factory function.
 * @return {Package}                   "This" package, to allow methods to be chained.
 */
Package.prototype.processor = function(processorFactory) {

  if (typeof processorFactory !== 'function' ) { throw new Error('processorFactory must be a function'); }
  if (!processorFactory.name) { throw new Error('processorFactory must have a name'); }

  this.processors.push(processorFactory.name);
  this.module.factory(processorFactory.name, processorFactory);
  return this;
};

/**
 * Add a new service, defined by a factory function, to the package
 * @param  {function} serviceFactory   The factory function that will be used by the injector to
 *                                     create the service.  The function must not be anonymous -
 *                                     it must have a name, e.g. `function myService() { ... }` -
 *                                     since the name of the service is taken from the name of the
 *                                     factory function.
 * @return {Package}                   "This" package, to allow methods to be chained.
 */
Package.prototype.factory = function(serviceFactory) {
  if (typeof serviceFactory !== 'function' ) {
    throw new Error('serviceFactory must be a function.\n' +
                    'Got "' + typeof serviceFactory + '"');
  }
  if (!serviceFactory.name) { throw new Error('serviceFactory must have a name'); }

  this.module.factory(serviceFactory.name, serviceFactory);
  return this;
};

/**
 * Add a new service, defined as a Type to instantiated, to the package
 * @param  {function} processorFactory The constructor function that will be used by the injector to
 *                                     create the processor.  The function must not be anonymous -
 *                                     it must have a name, e.g. `function MyType() { ... }` -
 *                                     since the name of the service is taken from the name of the
 *                                     constructor function.
 * @return {Package}                   "This" package, to allow methods to be chained.
 */
Package.prototype.type = function(ServiceType) {
  if (typeof ServiceType !== 'function' ) { throw new Error('ServiceType must be a constructor function'); }
  if (!ServiceType.name) { throw new Error('ServiceType must have a name'); }

  this.module.type(ServiceType.name, ServiceType);
  return this;
};

/**
 * Add a new config block to the package. Config blocks are run at the beginning of the doc
 * generation before the processors are run.  They can be injected with services and processors
 * to allow you access to their properties so that you can configure them.
 * @param  {function} configFn         The config block function to run
 * @return {Package}                   "This" package, to allow methods to be chained.
 */
Package.prototype.config = function(configFn) {
  if (typeof configFn !== 'function' ) { throw new Error('configFn must be a function'); }
  this.configFns.push(configFn);
  return this;
};

/**
 * @module Package
 */
module.exports = Package;