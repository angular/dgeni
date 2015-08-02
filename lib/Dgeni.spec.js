var Dgeni = require('./Dgeni');

describe("Dgeni", function() {
  var dgeni, mockLogger;

  beforeEach(function() {
    mockLogger = jasmine.createSpyObj('log', ['error', 'warning', 'info', 'debug', 'silly']);
    dgeni = new Dgeni();
    var mockLoggerPackage = dgeni.package('mockLogger');
    mockLoggerPackage.factory(function log() { return mockLogger; });
  });

  describe("constructor", function() {
    it("should accept an array of packages to load", function() {
      var package1 = new Dgeni.Package('package1');
      var package2 = new Dgeni.Package('package2');
      dgeni = new Dgeni([package1, package2]);
      expect(dgeni.packages.package1).toBe(package1);
      expect(dgeni.packages.package2).toBe(package2);
    });

    it("should complain if the packages parameter is not an array", function() {
      expect(function() {
        new new Dgeni('bad-param');
      }).toThrow();
    });
  });

  describe("package()", function() {

    it("should add the package to the packages property", function() {
      var testPackage = new Dgeni.Package('test-package');
      dgeni.package(testPackage);
      expect(dgeni.packages['test-package']).toEqual(testPackage);
    });

    it("should create a new package if passed a string", function() {
      var newPackage = dgeni.package('test-package');
      expect(Dgeni.Package.isPackage(newPackage)).toBeTruthy();
    });

    it("should throw an error if the not passed an instance of Package or a string name", function() {
      expect(function() {
        dgeni.package({});
      }).toThrow();
    });

    it("should complain if two packages have the same name", function() {
      dgeni.package('test');
      expect(function() {
        dgeni.package('test');
      }).toThrow();
    });

    it("should pass dependencies through to the new package", function() {
      var newPackage = dgeni.package('test-package', ['dep1', 'dep2']);
      expect(newPackage.dependencies).toEqual(['dep1', 'dep2']);
    });

    it("should load up package dependencies that are defined inline", function(done) {
      var log = [];
      var a = new Dgeni.Package('a').processor(function aProcessor() {
        return { $process: function() { log.push('a'); } };
      });
      var b = new Dgeni.Package('b', [a]);
      dgeni.package(b);
      expect(b.dependencies).toEqual([a]);
      expect(b.namedDependencies).toEqual(['a']);
      dgeni.generate().then(function() {
        expect(log).toEqual(['a']);
        done();
      });
    });

    it("should not load a dependency that is already loaded", function() {
      var log = [];

      // Load package a1, with name 'a'
      var a1 = new Dgeni.Package('a').processor({ name: 'a', $process: function() { log.push('a1');} });
      dgeni.package(a1);

      // Load package b with inline depencency on a2, which also has name 'a'
      // This second 'a' package (i.e. a2) should nt get loaded
      var a2 = new Dgeni.Package('a').processor({ name: 'a', $process: function() { log.push('a2');} });
      var b = new Dgeni.Package('b', [a2]);

      dgeni.package(b);

      expect(b.dependencies).toEqual([a2]);
      expect(b.namedDependencies).toEqual(['a']);
      dgeni.generate().then(function() {
        expect(log).toEqual(['a1']);
        done();
      });
    });

    it("should not modify the `dependencies` property of a package", function() {
      var a = new Dgeni.Package('a').processor({ name: 'a', $process: function() { } });
      var b = new Dgeni.Package('b', [a]).processor({ name: 'a', $process: function() { } });
      dgeni.package(b);
      expect(b.dependencies).toEqual([a]);
      expect(b.namedDependencies).toEqual(['a']);

    });
  });

  describe("configureInjector", function() {

    it("should return the configured injector", function() {
      var injector = dgeni.configureInjector();
      expect(injector.get).toEqual(jasmine.any(Function));
    });

    describe("services", function() {

      it("should add some basic shared services to the injector", function() {
        var injector = dgeni.configureInjector();

        expect(injector.get('dgeni')).toEqual(jasmine.any(Object));
        expect(injector.get('log')).toEqual(jasmine.any(Object));
        expect(injector.get('log').debug).toEqual(jasmine.any(Function));
        expect(injector.get('getInjectables')).toEqual(jasmine.any(Function));
      });

      it("should set stop on error defaults", function() {
        var stopOnProcessingError, stopOnValidationError;
        dgeni.package('testPackage').config(function(dgeni) {
          stopOnProcessingError = dgeni.stopOnProcessingError;
          stopOnValidationError = dgeni.stopOnValidationError;
        });
        var injector = dgeni.configureInjector();
        expect(stopOnProcessingError).toBe(true);
        expect(stopOnValidationError).toBe(true);
      });

      it("should add services to the injector", function() {
        var log = [];

        dgeni.package('test-package')
          .processor(function testProcessor(service1, service2) {
            return {
              $process: function(docs) {
                log.push(service1);
                log.push(service2);
              }
            };
          })
          .factory(function service1() { return 'service1 value'; })
          .factory(function service2(service1) { return service1 + ' service2 value'; });

        var injector = dgeni.configureInjector();
        injector.get('testProcessor').$process();
        expect(log).toEqual(['service1 value', 'service1 value service2 value']);
      });

      it("should add services from packages in the correct package dependency order", function() {
        var log = [];
        dgeni.package('test1', ['test2']).factory(function testValue() { return 'test 1'; });
        dgeni.package('test2').factory(function testValue() { return 'test 2'; });
        dgeni.package('test4', ['test3'])
          .processor(function test3Processor(testValue) {
            return {
              $process: function(docs) {
                log.push(testValue + '(overridden)'); }
            };
          });
        dgeni.package('test3', ['test1', 'test2'])
          .processor(function test3Processor(testValue) {
            return {
              $process: function(docs) {
                log.push(testValue); }
            };
          });
        var injector = dgeni.configureInjector();
        injector.get('test3Processor').$process();
        expect(log).toEqual(['test 1(overridden)']);
      });
    });

    describe("config blocks", function() {

      it("should run the config functions in the correct package dependency order", function() {
        var log = [];
        dgeni.package('test')
          .processor(function testProcessor() {
            return {
              $process: function() { log.push(this.testValue); }
            };
          });
        dgeni.package('test1', ['test2'])
          .config(function(testProcessor) { testProcessor.testValue = 1; });
        dgeni.package('test2', ['test'])
          .config(function(testProcessor) { testProcessor.testValue = 2; });
        var injector = dgeni.configureInjector();
        injector.get('testProcessor').$process();
        expect(log).toEqual([1]);
      });

      it("should provide config blocks with access to the injector", function() {
        var localInjector;
        dgeni.package('test')
          .config(function(injector) {
            localInjector = injector;
          });
        var injector = dgeni.configureInjector();
        expect(injector).toBe(localInjector);
      });
    });

    describe("eventHandlers", function() {

      it("should add eventHandlers in the correct package dependency order", function() {
        function handler1() {}
        function handler2() {}
        function handler3() {}
        function handler4() {}

        dgeni.package('test1', ['test2']).eventHandler('testEvent', function() { return handler1; });
        dgeni.package('test2')
          .eventHandler('testEvent', function() { return handler2; })
          .eventHandler('testEvent2', function() { return handler3; });
        dgeni.package('test3', ['test1']).eventHandler('testEvent', function() { return handler4; })

        dgeni.configureInjector();
        expect(dgeni.handlerMap).toEqual({
          testEvent: [handler2, handler1, handler4],
          testEvent2: [handler3]
        });
      });
    });

    describe("processors", function() {

      it("should order the processors by dependency", function() {
        var a = { $runAfter: ['c'], $process: function() { log.push('a'); } };
        var b = { $runAfter: ['c','e','a'], $process: function() { log.push('b'); } };
        var c = { $runBefore: ['e'], $process: function() { log.push('c'); } };
        var d = { $runAfter: ['a'], $process: function() { log.push('d'); } };
        var e = { $runAfter: [], $process: function() { log.push('e'); } };
        dgeni.package('test1')
          .processor('a', a)
          .processor('b', b)
          .processor('c', c)
          .processor('d', d)
          .processor('e', e);
        dgeni.configureInjector();
        expect(dgeni.processors).toEqual([c, e, a, b, d]);
      });

      it("should ignore processors that have $enabled set to false", function() {
        var a = { $process: function() {} };
        var b = { $enabled: false, $process: function() {} };
        var c = { $process: function() {} };
        dgeni.package('test1')
          .processor('a', a)
          .processor('b', b)
          .processor('c', c);
        dgeni.configureInjector();
        expect(dgeni.processors).toEqual([a,c]);
      });

      it("should allow config blocks to change $enabled on a processor", function() {
        var a = { $process: function() { log.push('a'); } };
        var b = { $enabled: false, $process: function() { log.push('b'); } };
        var c = { $process: function() { log.push('c'); } };
        dgeni.package('test1')
          .processor('a', a)
          .processor('b', b)
          .processor('c', c)
          .config(function(a,b,c) {
            a.$enabled = false;
            b.$enabled = true;
          });
        dgeni.configureInjector();
        expect(dgeni.processors).toEqual([b,c]);
      });

      it("should throw an error if the $runAfter dependencies are invalid", function() {
        dgeni.package('test')
          .processor(function badRunAfterProcessor() { return { $runAfter: ['tags-processed'] }; });
        expect(function() {
          dgeni.configureInjector();;
        }).toThrowError('Missing dependency: "tags-processed"  on "badRunAfterProcessor"');
      });

      it("should throw an error if the $runBefore dependencies are invalid", function() {
        dgeni.package('test')
          .processor(function badRunBeforeProcessor() { return { $runBefore: ['tags-processed'] }; });
        expect(function() {
          dgeni.configureInjector();;
        }).toThrowError('Missing dependency: "tags-processed"  on "badRunBeforeProcessor"');
      });

      it("should throw an error if the processor dependencies are cyclic", function() {
        dgeni.package('test')
          .processor(function processor1() { return { $runBefore: ['processor2'] }; })
          .processor(function processor2() { return { $runBefore: ['processor1'] }; });
        expect(function() {
          dgeni.configureInjector();;
        }).toThrowError('Dependency Cycle Found: processor1 -> processor2 -> processor1');
      });

      it("should allow config blocks to change the order of the processors", function(done) {
        log = [];
        dgeni.package('test')
          .processor(function a() { return { $runBefore: ['b'], $process: function(docs) { log.push('a' ); } }; })
          .processor(function b() { return { $runBefore: ['c'], $process: function(docs) { log.push('b' ); } }; })
          .processor(function c() { return { $process: function(docs) { log.push('c' ); } }; })
          .config(function(a, b, c) {
            b.$runBefore = [];
            c.$runBefore = ['b'];
          });
        dgeni.generate([]).then(function() {
            expect(log).toEqual(['a', 'c', 'b']);
            done();
          });
      });
    });
  });

  describe("triggerEvent()", function() {

    it("should run all the specified event's handlers in the correct dependency order", function() {
      var log = [];
      var handler1 = function() { log.push('handler1')};
      var handler2 = function() { log.push('handler2')};
      var handler3 = function() { log.push('handler3')};
      var handler4 = function() { log.push('handler4')};

      dgeni.package('test1', ['test2']).eventHandler('testEvent', function() { return handler1; });
      dgeni.package('test2')
        .eventHandler('testEvent', function() { return handler2; })
        .eventHandler('testEvent2', function() { return handler3; });
      dgeni.package('test3', ['test1']).eventHandler('testEvent', function() { return handler4; })

      dgeni.configureInjector();

      dgeni.triggerEvent('testEvent2');
      expect(log).toEqual(['handler3']);

      log = [];
      dgeni.triggerEvent('testEvent');
      expect(log).toEqual(['handler2', 'handler1', 'handler4']);
    });


    it("should pass through the call arguments to the handler", function() {
      var handler = jasmine.createSpy('handler');
      dgeni.package('test1', []).eventHandler('testEvent', function() { return handler; });
      dgeni.configureInjector();
      dgeni.triggerEvent('testEvent', 'arg1', 'arg2', 'arg3');
      expect(handler).toHaveBeenCalledWith('testEvent', 'arg1', 'arg2', 'arg3');
    });
  });

  describe("generate()", function() {

    describe("validation", function() {

      it("should fail if processor has an invalid property", function(done) {
        dgeni.package('test')
          .processor(function testProcessor() {
            return {
              $validate: { x: { presence: true } }
            };
          });

        dgeni.generate().catch(function(errors) {
          expect(errors).toEqual([{ processor : "testProcessor", package : "test", errors : { x : [ "X can't be blank" ] } }]);
          done();
        });
      });


      it("should not fail if all the processors properties are valid", function(done) {
        var log = [];
        dgeni.package('test')
          .processor(function testProcessor() {
            return {
              $validate: { x: { presence: true } },
              $process: function() { log.push(this.x); }
            };
          })
          .config(function(testProcessor) {
            testProcessor.x = 'not blank';
          });

        dgeni.generate().then(function() {
          expect(log).toEqual(['not blank']);
          done();
        });
      });

      it("should not fail if stopOnValidationError is false", function(done) {

        dgeni.package('test')
          .config(function(dgeni) {
            dgeni.stopOnValidationError = false;
          })
          .processor(function testProcessor() {
            return {
              $validate: { x: { presence: true } }
            };
          });

        var error;
        dgeni.generate()
          .catch(function(e) {
            error = e;
          })
          .finally(function() {
            expect(error).toBeUndefined();
            expect(mockLogger.error).toHaveBeenCalled();
            done();
          });
      });

    });

    describe("bad-processor", function() {
      var testPackage, doc, badProcessor;

      beforeEach(function() {
        testPackage = dgeni.package('test')
          .processor(function badProcessor() {
            return {
              $process: function() { throw new Error('processor failed'); }
            };
          });
        doc = {};
      });

      describe('stopOnProcessingError', function(done) {

        it("should fail if stopOnProcessingError is true and a processor throws an Error", function(done) {
          dgeni.generate()
            .catch(function(e) {
              expect(e).toBeDefined();
              done();
            });
        });

        it("should not fail but log the error if stopOnProcessingError is false a processor throws an Error", function(done) {

          var error;
          testPackage
            .config(function(dgeni) {
              dgeni.stopOnProcessingError = false;
            });

          dgeni.generate()
            .catch(function(e) {
              error = e;
            })
            .finally(function() {
              expect(error).toBeUndefined();
              expect(mockLogger.error).toHaveBeenCalled();
              done();
            });
        });

        it("should continue to process the subsequent processors after a bad-processor if stopOnProcessingError is false", function(done) {
          var called = false;

          testPackage
            .config(function(dgeni) {
              dgeni.stopOnProcessingError = false;
            })
            .processor(function checkProcessor() {
              return {
                $runAfter: ['badProcessor'],
                $process: function() {
                  called = true;
                }
              };
            });

          dgeni.generate().finally(function() {
            expect(called).toEqual(true);
            done();
          });
        });
      });
    });
  });
});