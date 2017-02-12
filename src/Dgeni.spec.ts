const {expect, spy} = require('chai').use(require('chai-spies'));

const Q = require('q');
import {Dgeni} from './Dgeni';
import {Processor} from './Processor';
import {DocCollection} from './DocCollection';


describe('Dgeni', () => {
  let dgeni, mockLogger;

  beforeEach(() => {
    mockLogger = spy.object(['error', 'warning', 'info', 'debug', 'silly']);
    dgeni = new Dgeni();
    const mockLoggerPackage = dgeni.package('mockLogger');
    mockLoggerPackage.factory(function log() { return mockLogger; });
  });

  describe('constructor', () => {
    it('should accept an array of packages to load', () => {
      const package1 = new Dgeni.Package('package1');
      const package2 = new Dgeni.Package('package2');
      dgeni = new Dgeni([package1, package2]);
      expect(dgeni.packages.package1).to.equal(package1);
      expect(dgeni.packages.package2).to.equal(package2);
    });

    it('should complain if the packages parameter is not an array', () => {
      expect(() => {
        new Dgeni('bad-param' as any);
      }).to.throw();
    });
  });

  describe('package()', () => {

    it('should add the package to the packages property', () => {
      const testPackage = new Dgeni.Package('test-package');
      dgeni.package(testPackage);
      expect(dgeni.packages['test-package']).to.eql(testPackage);
    });

    it('should create a new package if passed a string', () => {
      const newPackage = dgeni.package('test-package');
      expect(Dgeni.Package.isPackage(newPackage)).to.equal(true);
    });

    it('should throw an error if the not passed an instance of Package or a string name', () => {
      expect(() => {
        dgeni.package({});
      }).to.throw();
    });

    it('should complain if two packages have the same name', () => {
      dgeni.package('test');
      expect(() => {
        dgeni.package('test');
      }).to.throw();
    });

    it('should pass dependencies through to the new package', () => {
      const newPackage = dgeni.package('test-package', ['dep1', 'dep2']);
      expect(newPackage.dependencies).to.eql(['dep1', 'dep2']);
    });

    it('should load up package dependencies that are defined inline', function() {
      const log = [];
      const a = new Dgeni.Package('a').processor(function aProcessor() {
        return { $process: (docs: DocCollection) => { log.push('a'); } };
      });
      const b = new Dgeni.Package('b', [a]);
      dgeni.package(b);
      expect(b.dependencies).to.eql([a]);
      expect(b.namedDependencies).to.eql(['a']);
      return dgeni.generate().then(() => {
        expect(log).to.eql(['a']);
      });
    });

    it('should not load a dependency that is already loaded', function() {
      const log = [];

      // Load package a1, with name 'a'
      const a1 = new Dgeni.Package('a').processor({ name: 'a', $process: () => { log.push('a1'); } });
      dgeni.package(a1);

      // Load package b with inline depencency on a2, which also has name 'a'
      // This second 'a' package (i.e. a2) should nt get loaded
      const a2 = new Dgeni.Package('a').processor({ name: 'a', $process: () => { log.push('a2'); } });
      const b = new Dgeni.Package('b', [a2]);

      dgeni.package(b);

      expect(b.dependencies).to.eql([a2]);
      expect(b.namedDependencies).to.eql(['a']);
      return dgeni.generate().then(() => {
        expect(log).to.eql(['a1']);
      });
    });

    it('should not modify the `dependencies` property of a package', () => {
      const a = new Dgeni.Package('a').processor({ name: 'a', $process: () => { } });
      const b = new Dgeni.Package('b', [a]).processor({ name: 'a', $process: () => { } });
      dgeni.package(b);
      expect(b.dependencies).to.eql([a]);
      expect(b.namedDependencies).to.eql(['a']);

    });
  });

  describe('configureInjector', () => {

    it('should return the configured injector', () => {
      const injector = dgeni.configureInjector();
      expect(injector.get).to.be.a('function');
    });

    describe('services', () => {

      it('should add some basic shared services to the injector', () => {
        const injector = dgeni.configureInjector();

        expect(injector.get('dgeni')).to.be.an('object');
        expect(injector.get('log')).to.be.an('object');
        expect(injector.get('log').debug).to.be.a('function');
        expect(injector.get('getInjectables')).to.be.a('function');
      });

      it('should set stop on error defaults', () => {
        let stopOnProcessingError;
        dgeni.package('testPackage').config(function(dgeni) {
          stopOnProcessingError = dgeni.stopOnProcessingError;
        });
        dgeni.configureInjector();
        expect(stopOnProcessingError).to.equal(true);
      });

      it('should add services to the injector', () => {
        const log = [];

        dgeni.package('test-package')
          .processor(function testProcessor(service1, service2) {
            return {
              $process: () => {
                log.push(service1);
                log.push(service2);
              }
            };
          })
          .factory(function service1() { return 'service1 value'; })
          .factory(function service2(service1) { return service1 + ' service2 value'; });

        const injector = dgeni.configureInjector();
        injector.get('testProcessor').$process();
        expect(log).to.eql(['service1 value', 'service1 value service2 value']);
      });

      it('should add services from packages in the correct package dependency order', () => {
        const log = [];
        dgeni.package('test1', ['test2']).factory(function testValue() { return 'test 1'; });
        dgeni.package('test2').factory(function testValue() { return 'test 2'; });
        dgeni.package('test4', ['test3'])
          .processor(function test3Processor(testValue) {
            return {
              $process: () => {
                log.push(testValue + '(overridden)'); }
            };
          });
        dgeni.package('test3', ['test1', 'test2'])
          .processor(function test3Processor(testValue) {
            return {
              $process: () => {
                log.push(testValue); }
            };
          });
        const injector = dgeni.configureInjector();
        injector.get('test3Processor').$process();
        expect(log).to.eql(['test 1(overridden)']);
      });
    });

    describe('config blocks', () => {

      it('should run the config functions in the correct package dependency order', () => {
        const log = [];
        function testProcessor() {
          return {
            $process() { log.push(this.testValue); }
          };
        }
        dgeni.package('test')
          .processor(testProcessor);
        dgeni.package('test1', ['test2'])
          .config(function(testProcessor) { testProcessor.testValue = 1; });
        dgeni.package('test2', ['test'])
          .config(function(testProcessor) { testProcessor.testValue = 2; });
        const injector = dgeni.configureInjector();
        injector.get('testProcessor').$process();
        expect(log).to.eql([1]);
      });

      it('should provide config blocks with access to the injector', () => {
        let localInjector;
        dgeni.package('test')
          .config(function(injector) {
            localInjector = injector;
          });
        const injector = dgeni.configureInjector();
        expect(injector).to.equal(localInjector);
      });
    });

    describe('eventHandlers', () => {

      it('should add eventHandlers in the correct package dependency order', () => {
        function handler1() {}
        function handler2() {}
        function handler3() {}
        function handler4() {}

        dgeni.package('test1', ['test2']).eventHandler('testEvent', () => { return handler1; });
        dgeni.package('test2')
          .eventHandler('testEvent', () => { return handler2; })
          .eventHandler('testEvent2', () => { return handler3; });
        dgeni.package('test3', ['test1']).eventHandler('testEvent', () => { return handler4; });

        dgeni.configureInjector();
        expect(dgeni.handlerMap).to.have.property('testEvent').to.eql([handler2, handler1, handler4]);
        expect(dgeni.handlerMap).to.have.property('testEvent2').to.eql([handler3]);
      });
    });

    describe('legacy validation', () => {

      it('should fail if processor has an invalid property', function(done) {
        dgeni.package('test')
          .processor(function testProcessor() {
            return {
              $validate: { x: { presence: true } }
            };
          });

        dgeni.generate().catch(function(errors) {
          expect(errors).to.eql([{ processor : 'testProcessor', package : 'test', errors : { x : [ 'X can\'t be blank' ] } }]);
          done();
        });
      });
    });

    describe('processors', () => {

      it('should order the processors by dependency', () => {
        const log = [];
        const a = { $runAfter: ['c'], $process: () => { log.push('a'); } };
        const b = { $runAfter: ['c', 'e', 'a'], $process: () => { log.push('b'); } };
        const c = { $runBefore: ['e'], $process: () => { log.push('c'); } };
        const d = { $runAfter: ['a'], $process: () => { log.push('d'); } };
        const e = { $runAfter: [], $process: () => { log.push('e'); } };
        dgeni.package('test1')
          .processor('a', a)
          .processor('b', b)
          .processor('c', c)
          .processor('d', d)
          .processor('e', e);
        dgeni.configureInjector();
        expect(dgeni.processors).to.eql([c, e, a, b, d]);
      });

      it('should ignore processors that have $enabled set to false', () => {
        const a = { $process: () => {} };
        const b = { $enabled: false, $process: () => {} };
        const c = { $process: () => {} };
        dgeni.package('test1')
          .processor('a', a)
          .processor('b', b)
          .processor('c', c);
        dgeni.configureInjector();
        expect(dgeni.processors).to.eql([a, c]);
      });

      it('should allow config blocks to change $enabled on a processor', () => {
        const log = [];
        const a = { $process: () => { log.push('a'); } };
        const b = { $enabled: false, $process: () => { log.push('b'); } };
        const c = { $process: () => { log.push('c'); } };
        dgeni.package('test1')
          .processor('a', a)
          .processor('b', b)
          .processor('c', c)
          .config(function(a, b) {
            a.$enabled = false;
            b.$enabled = true;
          });
        dgeni.configureInjector();
        expect(dgeni.processors).to.eql([b, c]);
      });

      it('should throw an error if the $runAfter dependencies are invalid', () => {
        dgeni.package('test')
          .processor(function badRunAfterProcessor() { return { $runAfter: ['tags-processed'] }; });
        expect(() => {
          dgeni.configureInjector();
        }).to.throw('Missing dependency: "tags-processed"  on "badRunAfterProcessor"');
      });

      it('should throw an error if the $runBefore dependencies are invalid', () => {
        dgeni.package('test')
          .processor(function badRunBeforeProcessor() { return { $runBefore: ['tags-processed'] }; });
        expect(() => {
          dgeni.configureInjector();
        }).to.throw('Missing dependency: "tags-processed"  on "badRunBeforeProcessor"');
      });

      it('should throw an error if the processor dependencies are cyclic', () => {
        dgeni.package('test')
          .processor(function processor1() { return { $runBefore: ['processor2'] }; })
          .processor(function processor2() { return { $runBefore: ['processor1'] }; });
        expect(() => {
          dgeni.configureInjector();
        }).to.throw('Dependency Cycle Found: processor1 -> processor2 -> processor1');
      });

      it('should allow config blocks to change the order of the processors', function(done) {
        const log = [];
        dgeni.package('test')
          .processor(function a() { return { $runBefore: ['b'], $process: () => { log.push('a' ); } }; })
          .processor(function b() { return { $runBefore: ['c'], $process: () => { log.push('b' ); } }; })
          .processor(function c() { return { $process: () => { log.push('c' ); } }; })
          .config(function(a, b, c) {
            b.$runBefore = [];
            c.$runBefore = ['b'];
          });
        dgeni.generate([]).then(() => {
          expect(log).to.eql(['a', 'c', 'b']);
          done();
        });
      });
    });
  });

  describe('triggerEvent()', () => {

    it('should run all the specified event\'s handlers in the correct dependency order', function(done) {
      const log = [];
      const handler1 = () => { log.push('handler1'); };
      const handler2 = () => { log.push('handler2'); };
      const handler3 = () => { log.push('handler3'); };
      const handler4 = () => { log.push('handler4'); };

      dgeni.package('test1', ['test2']).eventHandler('testEvent', () => { return handler1; });
      dgeni.package('test2')
        .eventHandler('testEvent', () => { return handler2; })
        .eventHandler('testEvent2', () => { return handler3; });
      dgeni.package('test3', ['test1']).eventHandler('testEvent', () => { return handler4; });

      dgeni.configureInjector();

      dgeni.triggerEvent('testEvent').finally(() => {
        expect(log).to.eql(['handler2', 'handler1', 'handler4']);
        done();
      });
    });

    it('should pass through the call arguments to the handler', function(done) {
      const handler = spy('handler');
      dgeni.package('test1', []).eventHandler('testEvent', () => { return handler; });
      dgeni.configureInjector();
      dgeni.triggerEvent('testEvent', 'arg1', 'arg2', 'arg3').finally(() => {
        expect(handler).to.have.been.called.with('testEvent', 'arg1', 'arg2', 'arg3');
        done();
      });
    });

    it('should return a promise to event handler results', function(done) {
      function handler1() { }
      function handler2() { return true; }
      function handler3() { return { message: 'info' }; }
      function handler4() { return Q(); }
      function handler5() { return Q(true); }
      function handler6() { return Q({ message: 'info async'}); }

      dgeni.package('test1', [])
        .eventHandler('testEvent', () => { return handler1; })
        .eventHandler('testEvent', () => { return handler2; })
        .eventHandler('testEvent', () => { return handler3; })
        .eventHandler('testEvent', () => { return handler4; })
        .eventHandler('testEvent', () => { return handler5; })
        .eventHandler('testEvent', () => { return handler6; });
      dgeni.configureInjector();
      dgeni.triggerEvent('testEvent').then(function(results) {
        expect(results).to.eql([undefined, true, {message: 'info'}, undefined, true, {message: 'info async'}]);
        done();
      });
    });
  });

  describe('generate()', () => {

    describe('bad-processor', () => {
      let testPackage;

      beforeEach(() => {
        testPackage = dgeni.package('test')
          .processor(function badProcessor() {
            return {
              $process: () => { throw new Error('processor failed'); }
            };
          });
      });

      describe('stopOnProcessingError', () => {

        it('should fail if stopOnProcessingError is true and a processor throws an Error', function() {
          return dgeni.generate()
            .catch(function(e) {
              expect(e).to.exist;
            });
        });

        it('should not fail but log the error if stopOnProcessingError is false a processor throws an Error', function() {

          let error;
          testPackage
            .config(function(dgeni) {
              dgeni.stopOnProcessingError = false;
            });

          return dgeni.generate()
            .catch(function(e) {
              error = e;
            })
            .finally(() => {
              expect(error).to.be.undefined;
              expect(mockLogger.error).to.have.been.called();
            });
        });

        it('should continue to process the subsequent processors after a bad-processor if stopOnProcessingError is false', function() {
          let called = false;

          testPackage
            .config(function(dgeni) {
              dgeni.stopOnProcessingError = false;
            })
            .processor(function checkProcessor() {
              return {
                $runAfter: ['badProcessor'],
                $process: () => {
                  called = true;
                }
              };
            });

          return dgeni.generate().finally(() => {
            expect(called).to.eql(true);
          });
        });
      });
    });
  });
});