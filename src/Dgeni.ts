/* tslint globals: require: true */
const _ = require('lodash');
const di = require('di');
const Q = require('q');

import {Package, PackageRef} from './Package';
import {Injector} from './Injector';
import {Processor} from './Processor';
import {processorValidationPackage} from './legacyPackages/processorValidation';
import {sortByDependency} from './util/dependency-sort';

import {getInjectablesFactory} from './util/getInjectables';
import {logFactory} from './util/log';

/**
 * Create an instance of the Dgeni documentation generator, loading any packages passed in as a
 * parameter.
 * @param {Package[]} [packages] A collection of packages to load
 */
export class Dgeni {
  static Package = Package;

  injector: Injector;
  packages: { [key: string]: Package } = {};
  processors: Processor[];
  stopOnProcessingError: boolean;
  handlerMap: {[key: string]: Function[]};

  constructor(packages: Package[] = []) {
    if ( !Array.isArray(packages) ) { throw new Error('packages must be an array'); }
    // Add in the legacy validation that was originally part of the core Dgeni tool.
    this.package(processorValidationPackage);
    packages.map(p => this.package(p));
  }

  /**
   * Load a package into dgeni
   * @param  package The package to load or the name of a new package to create.
   * @param  dependencies A collection of dependencies for this package
   * @return The package that was loaded, to allow chaining
   */
  package(pkg: PackageRef, dependencies: PackageRef[] = []) {

    if ( this.injector) { throw new Error('injector already configured - you cannot add a new package'); }

    if ( typeof pkg === 'string' ) { pkg = new Package(pkg, dependencies); }
    if ( !(Package.isPackage(pkg)) ) { throw new Error('package must be an instance of Package'); }
    if ( this.packages[pkg.name] ) {
      throw new Error('The "' + pkg.name + '" package has already been loaded');
    }
    this.packages[pkg.name] = pkg;

    // Extract all inline packages and load them into dgeni;
    pkg.namedDependencies = pkg.dependencies.map((dependency) => {
      if ( Package.isPackage(dependency) ) {
        // Only load dependent package if not already loaded
        if ( !this.packages[dependency.name] ) { this.package(dependency); }
        return dependency.name;
      }
      return dependency;
    });

    // Return the package to allow chaining
    return pkg;
  }

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
   * const Dgeni = require('dgeni');
   *
   * function getInjector() {
   *   const dgeni = new Dgeni();
   *   dgeni.package('testPackage', [require('dgeni-packages/base')])
   *     .factory('templateEngine', function dummyTemplateEngine() {});
   *   return dgeni.configureInjector();
   * };
   *
   * describe('someService', function() {
   *   const someService;
   *   beforeEach(function() {
   *     const injector = getInjector();
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
  configureInjector() {

    if ( !this.injector ) {

      // Sort the packages by their dependency - ensures that services and configs are loaded in the
      // correct order
      const packages: Package[] = this.packages = sortByDependency(this.packages, 'namedDependencies');

      // Create a module containing basic shared services
      this.stopOnProcessingError = true;
      const dgeniModule = new di.Module()
        .value('dgeni', this)
        .factory('log', logFactory)
        .factory('getInjectables', getInjectablesFactory);

      // Create the dependency injection container, from all the packages' modules
      const modules = packages.map(pkg => pkg.module);
      modules.unshift(dgeniModule);

      // Create the injector and
      const injector = this.injector = new di.Injector(modules);

      // Apply the config blocks
      packages.forEach((pkg) => pkg.configFns.forEach((configFn) => injector.invoke(configFn)));

      // Get the the processors and event handlers
      const processorMap = {};
      this.handlerMap = {};
      packages.forEach((pkg) => {

        pkg.processors.forEach(function(processorName) {
          const processor = injector.get(processorName);
          // Update the processor's name and package
          processor.name = processorName;
          processor.$package = pkg.name;

          // Ignore disabled processors
          if ( processor.$enabled !== false ) {
            processorMap[processorName] = processor;
          }
        });

        for (const eventName in pkg.handlers) {
          const handlers: Function[] = this.handlerMap[eventName] = (this.handlerMap[eventName] || []);
          pkg.handlers[eventName].forEach(handlerName => handlers.push(injector.get(handlerName)));
        }
      });

      // Once we have configured everything sort the processors.
      // This allows the config blocks to modify the $runBefore and $runAfter properties of processors.
      // (Crazy idea, I know, but useful for things like debugDumpProcessor)
      this.processors = sortByDependency(processorMap, '$runAfter', '$runBefore');
    }

    return this.injector;
  }

  /**
   * Generate the documentation using the loaded packages
   * @return {Promise} A promise to the generated documents
   */
  generate() {
    const injector = this.configureInjector();
    const log = injector.get('log');

    let processingPromise = this.triggerEvent('generationStart');

    // Process the docs
    const currentDocs = [];
    processingPromise = processingPromise.then(() => currentDocs);

    this.processors.forEach(processor => {
      processingPromise = processingPromise.then(docs => this.runProcessor(processor, docs));
    });

    processingPromise.catch(error => log.error('Error processing docs: ', error.stack || error.message || error ));

    return processingPromise.then(docs => {
      this.triggerEvent('generationEnd');
      return docs;
    });
  }


  runProcessor(processor, docs) {
    const log = this.injector.get('log');
    const promise = Q(docs);

    if ( !processor.$process ) {
      return promise;
    }

    return promise

      .then(() => {
        log.info('running processor:', processor.name);
        return this.triggerProcessorEvent('processorStart', processor, docs);
      })

      // We need to wrap this $process call in a new promise handler so that we can catch
      // errors triggered by exceptions thrown in the $process method
      // before they reach the promise handlers
      .then(docs => processor.$process(docs) || docs)

      .then(docs => this.triggerProcessorEvent('processorEnd', processor, docs))

      .catch((error) => {
        error.message = 'Error running processor "' + processor.name + '":\n' + error.message;
        log.error(error.stack || error.message);
        if ( this.stopOnProcessingError ) { return Q.reject(error); }
        return docs;
      });
  }

  /**
   * Trigger a dgeni event and run all the registered handlers
   * All the arguments to this call are passed through to each handler
   * @param  {string} eventName The event being triggered
   * @return {Promise} A promise to an array of the results from each of the handlers
   */
  triggerEvent(eventName: string, ...extras: any[]) {
    const handlers = this.handlerMap[eventName];
    let handlersPromise = Q();
    const results = [];
    if (handlers) {
      handlers.forEach(handler => {
        handlersPromise = handlersPromise.then(() => {
          const handlerPromise = Q(handler(eventName, ...extras));
          handlerPromise.then(result => results.push(result));
          return handlerPromise;
        });
      });
    }
    return handlersPromise.then(() => results);
  }

  triggerProcessorEvent(eventName: string, processor, docs) {
    return this.triggerEvent(eventName, processor, docs).then(() => docs);
  }


  info() {
    const injector = this.configureInjector();
    const log = injector.get('log');

    for (const pkgName in this.packages) {
      log.info(pkgName, '[' + this.packages[pkgName].dependencies.map(function(dep) { return JSON.stringify((dep as Package).name); }).join(', ') + ']');
    }

    log.info('== Processors (processing order) ==');

    this.processors.forEach((processor, index) => {
      log.info((index + 1) + ': ' + processor.name, processor.$process ? '' : '(abstract)', ' from ', processor.$package);
      if ( processor.description ) { log.info('   ', processor.description); }
    });
  };
}
