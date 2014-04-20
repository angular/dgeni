import { Config } from './config';
import { Injector, Provide } from './di';
import { DepGraph } from 'dependency-graph';

module log from 'winston';
module Q from 'q';

export class DocProcessorManager {

  constructor(processors) {
    this.processors = new Map;
    this.configFns = [];
    processors.forEach((processor)=>{this.addProcessor(processor)});
  }

  addProcessor(processor) {
    this.processors.set(processor.name, processor);
  }

  addConfig(configFn) {
    this.configFns.push(configFn);
  }

  run() {
    var processors = this._sortProcessors();
    var config = this._getConfig(processors);
    var injector = new Injector(processors);
    var docs = [];
    var providers = new Map;
    providers.set('config', config);
    processors.forEach(function(processor) {
      providers.set('docs', docs);
      var childInjector = new Injector([], injector, providers);
      // This will invoke the processor function
      childInjector.get(processor);
      // TODO: deal with async processors (with promises)
    });
  }

  // Ensure that we are running the processors in the right order
  _sortProcessors() {
    var depGraph = new DepGraph;

    // There is a bug with es6-shim / traceur that means iterating directly
    // over `this.processors.keys()` fails

    this.processors.forEach((processor, name) => {
      depGraph.addNode(name);
    });

    this.processors.forEach((processor) => {
      if ( processor.runBefore ) {
        if ( Array.isArray(processor.runBefore) ) {
          processor.runBefore.forEach((name)=>{
            depGraph.addDependency(name, processor.name);
          });
        } else {
          throw new Error('Error in processor "' + processor.name + '" - runBefore must be an array');
        }
      }

      if ( processor.runAfter ) {
        if ( Array.isArray(processor.runAfter) ) {
          processor.runAfter.forEach((name)=>{
            depGraph.addDependency(processor.name, name);
          });
        } else {
          throw new Error('Error in processor "' + processor.name + '" - runAfter must be an array');
        }
      }
    });

    var orderedProcessors = depGraph.overallOrder().map((name)=>{
      return this.processors.get(name);
    });

    return orderedProcessors;
  }

  // Get a new config object that has been processed on by the processors and configFns
  _getConfig(processors) {
    var config = new Config;

    // Run the config function, if found, from each processor
    processors.forEach((processor)=>{
      if ( typeof processor.config === 'function' ) {
        processor.config(config);
      }
    });

    // Now run any config functions added to the manager directly
    this.configFns.forEach((configFn)=>{
      configFn(config);
    });
  }
}