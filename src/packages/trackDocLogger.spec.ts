const {expect, spy} = require('chai').use(require('chai-spies'));

import {Dgeni} from '../Dgeni';
import {trackDocLoggerPackage} from './trackDocLogger';

describe('trackDocLogger', function() {

  let dgeni, mockLogger;

  beforeEach(function() {
    mockLogger = spy.object('log', ['error', 'warning', 'info', 'debug', 'silly']);
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


  it('should log each generation of changes to the tracked doc', function() {

    function trackDocWithIdOne(docs) {
      return docs.filter((doc) => doc.id === 1);
    }

    dgeni.package('testConfig')
      .config(function(trackDocLoggerOptions) {
        trackDocLoggerOptions.docsToTrackFn = trackDocWithIdOne;
      });

    return dgeni.generate()
      .then(function() {
        expect(mockLogger.info).to.have.been.called.with('trackDocLogger settings:', { docsToTrackFn : trackDocWithIdOne });
        expect(mockLogger.info).to.have.been.called.with('trackDocLogger tracked changes:', [
          { processor : 'initial', docs : [ { id : 1, name : 'one' } ] },
          { processor : 'second', docs : [ { id : 1, name : 'one', path : '/1' } ] }
        ]);
      });
  });
});