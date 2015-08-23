var Dgeni = require('../Dgeni');
var processorValidationPackage = require('./processorValidation');

describe("processorValidation", function() {

  var dgeni, mockLogger;

  beforeEach(function() {
    mockLogger = jasmine.createSpyObj('log', ['error', 'warning', 'info', 'debug', 'silly']);
    dgeni = new Dgeni();
    var mockLoggerPackage = dgeni.package('mockLogger');
    mockLoggerPackage.factory(function log() { return mockLogger; });
  });

  it("should set stop on error defaults", function() {
    var stopOnProcessingError, stopOnValidationError;
    dgeni.package('testPackage', [processorValidationPackage])
      .config(function(dgeni) {
        stopOnProcessingError = dgeni.stopOnProcessingError;
        stopOnValidationError = dgeni.stopOnValidationError;
      });
    var injector = dgeni.configureInjector();
    expect(stopOnProcessingError).toBe(true);
    expect(stopOnValidationError).toBe(true);
  });


  it("should fail if processor has an invalid property", function(done) {
    dgeni.package('testPackage', [processorValidationPackage])
      .processor(function testProcessor() {
        return {
          $validate: { x: { presence: true } }
        };
      });

    dgeni.generate().catch(function(errors) {
      expect(errors).toEqual([{ processor : "testProcessor", package : "testPackage", errors : { x : [ "X can't be blank" ] } }]);
      done();
    });
  });


  it("should not fail if all the processors properties are valid", function(done) {
    var log = [];
    dgeni.package('testPackage', [processorValidationPackage])
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
    dgeni.package('testPackage', [processorValidationPackage])
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