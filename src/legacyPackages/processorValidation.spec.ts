const {expect, spy} = require('chai').use(require('chai-spies'));

import {Dgeni} from '../Dgeni';
import {processorValidationPackage} from './processorValidation';

describe('processorValidation', () => {

  let dgeni, mockLogger;

  beforeEach(() => {
    mockLogger = spy.object('log', ['error', 'warning', 'info', 'debug', 'silly']);
    dgeni = new Dgeni();
    const mockLoggerPackage = dgeni.package('mockLogger');
    mockLoggerPackage.factory(function log() { return mockLogger; });
  });

  it('should set stop on error defaults', () => {
    let stopOnProcessingError, stopOnValidationError;
    dgeni.package('testPackage', [processorValidationPackage])
      .config(function(dgeni) {
        stopOnProcessingError = dgeni.stopOnProcessingError;
        stopOnValidationError = dgeni.stopOnValidationError;
      });
    dgeni.configureInjector();
    expect(stopOnProcessingError).to.equal(true);
    expect(stopOnValidationError).to.equal(true);
  });


  it('should fail if processor has an invalid property', function() {
    dgeni.package('testPackage', [processorValidationPackage])
      .processor(function testProcessor() {
        return {
          $validate: { x: { presence: true } }
        };
      });

    return dgeni.generate().catch(function(errors) {
      expect(errors).to.eql([{ processor : 'testProcessor', package : 'testPackage', errors : { x : [ 'X can\'t be blank' ] } }]);
    });
  });


  it('should not fail if all the processors properties are valid', function() {
    const log = [];
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

    return dgeni.generate().then(() => {
      expect(log).to.eql(['not blank']);
    });
  });

  it('should not fail if stopOnValidationError is false', function() {
    dgeni.package('testPackage', [processorValidationPackage])
      .config(function(dgeni) {
        dgeni.stopOnValidationError = false;
      })
      .processor(function testProcessor() {
        return {
          $validate: { x: { presence: true } }
        };
      });

    return dgeni.generate()
      .then(function() {
        expect(mockLogger.error).to.have.been.called();
      });
  });
});
