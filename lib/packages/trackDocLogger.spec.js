/*eslint-disable no-console */
var Dgeni = require('../Dgeni');
var trackDocLoggerPackage = require('./trackDocLogger');
var _ = require('lodash');

describe('trackDocLogger', function() {

  var dgeni, mockLogger;

  beforeEach(function() {
    mockLogger = jasmine.createSpyObj('log', ['error', 'warning', 'info', 'debug', 'silly']);
    dgeni = new Dgeni();

    dgeni.package('mockLogger')
      .factory(function log() { return mockLogger; });

    dgeni.package('testProcessors', [trackDocLoggerPackage])
      .processor('initial', function() {
        return {
          $process: function() {
            return [
              { id: 1, name: 'one' },
              { id: 2, name: 'two' },
              { id: 3, name: 'three' }
            ];
          }
        };
      })
      .processor('first', function() {
        return {
          $runAfter: ['initial'],
          $process: function() {
          }
        };
      })
      .processor('second', function() {
        return {
          $runAfter: ['first'],
          $process: function() {
            return [
              { id: 1, name: 'one', path: '/1' },
              { id: 2, name: 'two', path: '/2' },
              { id: 3, name: 'three', path: '/3' }
            ];
          }
        };
      });
  });


  it('should log each generation of changes to the tracked doc', function(done) {

    function trackDocWithIdOne(docs) {
      return _.filter(docs, function(doc) {
        return doc.id === 1;
      });
    }

    dgeni.package('testConfig')
      .config(function(trackDocLoggerOptions) {
        trackDocLoggerOptions.docsToTrackFn = trackDocWithIdOne;
      });

    dgeni.generate()
      .then(function() {
        expect(mockLogger.info).toHaveBeenCalledWith('trackDocLogger settings:', { docsToTrackFn : trackDocWithIdOne });
        expect(mockLogger.info).toHaveBeenCalledWith('trackDocLogger tracked changes:', [
          { processor : 'initial', docs : [ { id : 1, name : 'one' } ] },
          { processor : 'second', docs : [ { id : 1, name : 'one', path : '/1' } ] }
        ]);
        done();
      })
      .catch(function(error) {
        console.log(error.stack);
        done(error);
      });
  });
});