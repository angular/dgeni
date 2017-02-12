const {expect, spy} = require('chai').use(require('chai-spies'));

import {Dgeni} from '../Dgeni';
import {docDiffLoggerPackage} from './docDiffLogger';

describe('docDiffLogger', function() {

  let dgeni, mockLogger;

  beforeEach(function() {
    mockLogger = spy.object('log', ['error', 'warning', 'info', 'debug', 'silly']);
    dgeni = new Dgeni();

    dgeni.package('mockLogger')
      .factory(function log() { return mockLogger; });

    dgeni.package('testProcessors', [docDiffLoggerPackage])
      .processor('initial', function() {
        return {
          $process: function() {}
        };
      })
      .processor('first', function() {
        return {
          $runAfter: ['initial'],
          $process: function(docs) {
            docs.push({ id: 'doc-1' });
            docs.push({ id: 'doc-2' });
          }
        };
      })
      .processor('second', function() {
        return {
          $runAfter: ['first'],
          $process: function(docs) {
            docs[0].extra = 'stuff';
          }
        };
      });
  });

  it('should log the difference between the first and last processor', function() {
    return dgeni.generate()
      .then(function() {
        expect(mockLogger.info).to.have.been.called.with({
          changed: 'object change',
          value : {
            0 : { changed : 'added', value : { id : 'doc-1', extra : 'stuff' } },
            1: { changed : 'added', value : { id : 'doc-2' } }
          }});
      });
  });

  it('should log the difference between the start and last processor', function() {
    dgeni.package('testConfig')
      .config(function(docDiffLoggerOptions) {
        docDiffLoggerOptions.start = 'first';
      });
    return dgeni.generate()
      .then(function() {
        expect(mockLogger.info).to.have.been.called.with({
          changed: 'object change',
          value : {
            0 : { changed : 'added', value : { id : 'doc-1', extra : 'stuff' } },
            1: { changed : 'added', value : { id : 'doc-2' } }
          }
        });
      });
  });

  it('should log the difference between the first and end processor', function() {
    dgeni.package('testConfig')
      .config(function(docDiffLoggerOptions) {
        docDiffLoggerOptions.end = 'first';
      });
    return dgeni.generate()
      .then(function() {
        expect(mockLogger.info).to.have.been.called.with({
          changed: 'object change',
          value : {
            0 : { changed : 'added', value : { id : 'doc-1' } },
            1: { changed : 'added', value : { id : 'doc-2' } }
          }
        });
      });
  });

  it('should log the difference between the start and end processor', function() {
    dgeni.package('testConfig')
      .config(function(docDiffLoggerOptions) {
        docDiffLoggerOptions.start = 'second';
        docDiffLoggerOptions.end = 'second';
      });
    return dgeni.generate()
      .then(function() {
        expect(mockLogger.info).to.have.been.called.with({
          changed: 'object change',
          value : {
            0 : {
              changed : 'object change',
              value : {
                id : { changed: 'equal', value: 'doc-1' },
                extra : { changed: 'added', value: 'stuff' }
              }
            },
            1: {
              changed : 'equal',
              value : { id : 'doc-2' }
            }
          }
        });
      });
  });
});