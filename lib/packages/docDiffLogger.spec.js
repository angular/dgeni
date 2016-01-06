/*eslint-disable no-console */
var Dgeni = require('../Dgeni');
var docDiffLoggerPackage = require('./docDiffLogger');

describe('docDiffLogger', function() {

  var dgeni, mockLogger;

  beforeEach(function() {
    mockLogger = jasmine.createSpyObj('log', ['error', 'warning', 'info', 'debug', 'silly']);
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

  it('should log the difference between the first and last processor', function(done) {
    dgeni.generate()
      .then(function() {
        expect(mockLogger.info).toHaveBeenCalledWith(jasmine.objectContaining({ changed: 'object change' }));
        done();
      })
      .catch(function(error) {
        console.log(error.stack);
        done(error);
      });
  });

  it('should log the difference between the start and last processor', function(done) {
    dgeni.package('testConfig')
      .config(function(docDiffLoggerOptions) {
        docDiffLoggerOptions.start = 'first';
      });
    dgeni.generate()
      .then(function() {
        expect(mockLogger.info).toHaveBeenCalledWith({
          changed: 'object change',
          value : {
            0 : { changed : 'added', value : { id : 'doc-1', extra : 'stuff' } },
            1: { changed : 'added', value : { id : 'doc-2' } }
          }
        });
        done();
      })
      .catch(function(error) {
        console.log(error.stack);
        done(error);
      });
  });

  it('should log the difference between the first and end processor', function(done) {
    dgeni.package('testConfig')
      .config(function(docDiffLoggerOptions) {
        docDiffLoggerOptions.end = 'first';
      });
    dgeni.generate()
      .then(function() {
        expect(mockLogger.info).toHaveBeenCalledWith({
          changed: 'object change',
          value : {
            0 : { changed : 'added', value : { id : 'doc-1' } },
            1: { changed : 'added', value : { id : 'doc-2' } }
          }
        });
        done();
      })
      .catch(function(error) {
        console.log(error.stack);
        done(error);
      });
  });

  it('should log the difference between the start and end processor', function(done) {
    dgeni.package('testConfig')
      .config(function(docDiffLoggerOptions) {
        docDiffLoggerOptions.start = 'second';
        docDiffLoggerOptions.end = 'second';
      });
    dgeni.generate()
      .then(function() {
        expect(mockLogger.info).toHaveBeenCalledWith({
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
        done();
      })
      .catch(function(error) {
        console.log(error.stack);
        done(error);
      });
  });
});