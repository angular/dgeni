var Dgeni = require('../lib/Dgeni');

describe("Dgeni", function() {
  var dgeni, mockLogger;

  beforeEach(function() {
    mockLogger = jasmine.createSpyObj('log', ['error', 'warning', 'info', 'debug', 'silly']);
    dgeni = new Dgeni();
    dgeni.package('mockLogger').factory('log', function() { return mockLogger; });
  });

  describe("constructor", function() {
    it("should accept an array of packages to load", function() {
      var package1 = new Dgeni.Package('package1');
      var package2 = new Dgeni.Package('package2');
      dgeni = new Dgeni([package1, package2]);
      expect(dgeni.packages.package1).toBe(package1);
      expect(dgeni.packages.package2).toBe(package2);
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
      expect(newPackage instanceof Dgeni.Package).toBeTruthy();
    });
    it("should throw an error if the not passed an instance of Package or a string name", function() {
      expect(function() {
        dgeni.package({});
      }).toThrow();
    });
    it("should pass dependencies through to the new package", function() {
      var newPackage = dgeni.package('test-package', ['dep1', 'dep2']);
      expect(newPackage.dependencies).toEqual(['dep1', 'dep2']);
    });
  });

  describe("generate()", function() {

    describe("packages", function() {

      it("should add services from packages in the correct package dependency order", function(done) {
        var log = [];
        dgeni.package('test1', ['test2'])
          .factory('testValue', function() { return 'test 1'; });
        dgeni.package('test2')
          .factory('testValue', function() { return 'test 2'; });
        dgeni.package('test3', ['test1', 'test2'])
          .processor('test3-processor', function(testValue) {
            return {
              $process: function(docs) { log.push(testValue); }
            };
          });
        dgeni.generate()
          .then(function() {
            expect(log).toEqual(['test 1']);
          })
          .finally(done);
      });

      it("should complain if the two packages have the same name", function() {
        dgeni.package('test');
        expect(function() {
          dgeni.package('test');
        }).toThrow();
      });

    });


    describe("config blocks", function() {

      it("should run the config functions in the correct package dependency order", function(done) {
        var log = [];
        dgeni.package('test')
          .processor('testProcessor', function() {
            return {
              $process: function() { log.push(this.testValue); }
            };
          });
        dgeni.package('test1', ['test2'])
          .config(function(testProcessor) { testProcessor.testValue = 1; });
        dgeni.package('test2', ['test'])
          .config(function(testProcessor) { testProcessor.testValue = 2; });
        dgeni.generate()
          .then(function() {
            expect(log).toEqual([1]);
          })
          .finally(done);
      });

      it("should provide access to the injector", function(done) {
        var localInjector;
        dgeni.package('test')
          .config(function(injector) {
            localInjector = injector;
          });
        dgeni.generate().finally(function() {
          expect(localInjector.get('injector')).toBe(localInjector);
          done();
        });
      });
    });


    describe("services", function() {
      it("should add services to the injector", function(done) {
        var log = [];

        dgeni.package('test-package')
          .processor('testProcessor', function(service1, service2) {
            return {
              $process: function(docs) {
                log.push(service1);
                log.push(service2);
              }
            };
          })
          .factory('service1', function() { return 'service1 value'; })
          .factory('service2', function(service1) { return service1 + ' service2 value'; });

        dgeni.generate().finally(function() {
          expect(log).toEqual(['service1 value', 'service1 value service2 value']);
          done();
        });
      });

    });


    describe("processors", function() {

      describe("dependencies", function() {

        it("should order the processors by dependency", function(done) {
          var log = [];
          dgeni.package('test1')
            .processor('a', function() { return { $runAfter: ['c'], $process: function() { log.push('a'); } }; })
            .processor('b', function() { return { $runAfter: ['c','e','a'], $process: function() { log.push('b'); } }; })
            .processor('c', function() { return { $runBefore: ['e'], $process: function() { log.push('c'); } }; })
            .processor('d', function() { return { $runAfter: ['a'], $process: function() { log.push('d'); } }; })
            .processor('e', function() { return { $runAfter: [], $process: function() { log.push('e'); } }; });
          dgeni.generate()
            .finally(function() {
              expect(log).toEqual(['c', 'e', 'a', 'b', 'd']);
              done();
            });
        });

        it("should throw an error if the processor dependencies are invalid", function() {
          expect(function() {
            dgeni.package('test')
              .processor('bad-runAfter-processor', { runAfter: 'tags-processed' });
          }).toThrow();

          expect(function() {
            dgeni.package('test')
              .processor({ name: 'bad-runBefore-processor', runBefore: 'tags-processed' });
          }).toThrow();

        });
      });

      describe("validation", function() {

        it("should fail if processor has an invalid property", function(done) {
          dgeni.package('test')
            .processor('testProcessor', function() {
              return {
                $validate: { x: { presence: true } }
              };
            });

          dgeni.generate().catch(function(errors) {
            expect(errors).toEqual({ x : ["X can't be blank" ] });
            done();
          });
        });


        it("should not fail if all the processors properties are valid", function(done) {
          var log = [];
          dgeni.package('test')
            .processor('testProcessor', function() {
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

        it("should not fail if stopOnValidationError is false", function() {
          dgeni.stopOnValidationError = false;

          dgeni.package('test')
            .processor('testProcessor', function() {
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
            .processor('badProcessor', function() {
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
            dgeni.stopOnProcessingError = false;

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

          it("should continue to process the subsequent processors after a bad-processor if stopOnProcessingError is false", function(done) {
            dgeni.stopOnProcessingError = false;
            var called = false;

            testPackage.processor('checkProcessor', function() {
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
});