var Q = require('q');
var docProcessorFactory = require('../lib/doc-processor');
var tagParser = jasmine.createSpyObj('tagParser', ['parse', 'getTags']);
var tagDefs = [];
var log = require('winston');
var Config = require('../lib/config').Config;

describe("doc-processor", function() {

  it("should throw error if the config is invalid", function() {
    expect(function() {
      docProcessorFactory({});
    }).toThrow('Invalid config - you must provide an instance of Config');

    expect(function() {
      docProcessorFactory(new Config());
    }).toThrow('Invalid config - you must provide a config object with a "processing" property');

    expect(function() {
      docProcessorFactory({
        processing: {
          processors: [{ }]
        }
      });
    }).toThrow();

    expect(function() {
      docProcessorFactory({
        processing: {
          processors: [{ name: 'bad-runAfter-processor', runAfter: 'tags-processed' }]
        }
      });
    }).toThrow();

    expect(function() {
      docProcessorFactory({
        processing: {
          processors: [{ name: 'bad-runBefore-processor', runAfter: 'tags-processed' }]
        }
      });
    }).toThrow();
  });

  it("should call init on processors that have the method", function() {
    var processor = { name: 'init-test', init: jasmine.createSpy('init') };
    var config = new Config({ processing: {
      processors: [processor]
    } });
    var process = docProcessorFactory(config);
    process();
    expect(processor.init).toHaveBeenCalledWith(config, jasmine.any(Object));
  });

  it("should add items to the injectables", function() {
    var config = new Config({ processing: {} });
    processor = { name: 'injectables-test', process: function(extraData, injector) {
      expect(extraData).toBe(jasmine.any(Object));
      expect(injector).toBe(jasmine.any(Object));
    } };
    config.set('processing.processors', [processor]);
    var process = docProcessorFactory(config);
    process();
  });

  it("should add exports to the di module", function() {
    var processCalled = false;
    var process = function(export1, export2) {
      expect(export1).toEqual('export1 value');
      expect(export2).toEqual('export2 vqlue');
      processCalled = true;
    };
    var config = new Config({
      processing: {
        processors: [
          {
            name: 'test-processor',
            exports: {
              export1: [ 'value', 'export1 value'],
              export2: [ 'factory', function() { return 'export2 value'; }]
            },
            process: process
          }
        ]
      }
    });
    var processDocs = docProcessorFactory(config);
    return processDocs([]).then(function() {
      expect(processCalled).toEqual(true);
    });
  });

  it("should call each of the processors in turn, passing the docs object to each", function() {
    var log = [], docs = [ { content: 'a'}, { content: 'b'}];
    before = { name: 'before', process: function(docs) { log.push('before'); } };
    middle = { name:'middle', process: function(docs) { log.push('middle'); } };
    after = { name: 'after', process: function(docs) { log.push('after'); } };


    var config = new Config({
      processing: {
        processors: [before, middle, after]
      }
    });

    var process = docProcessorFactory(config);
    return process(docs).then(function(docs) {
      expect(log).toEqual(['before', 'middle', 'after']);
      expect(docs).toEqual(docs);
    }).done();
  });

  // AGH this is a pain to test when async...
  describe("bad-processor", function() {
    var process, doc, badProcessor;

    beforeEach(function() {
      badProcessor = {
        name: 'bad-processor',
        process: function() { throw new Error('processor failed'); }
      };
      doc = {};
    });

    describe('config: processing.stopOnError', function() {

      it("should fail if stopOnError is true a processor throws an Error", function() {
        process = docProcessorFactory(new Config({ processing: {stopOnError: true,  processors: [badProcessor]} }));
        var error;
        return process([doc])
          .catch(function(e) {
            error = e;
          })
          .finally(function() {
            expect(error).toBeDefined();
          });
      });

      it("should not fail but log the error if stopOnError is false a processor throws an Error", function() {
        process = docProcessorFactory(new Config({ processing: {stopOnError: false,  processors: [badProcessor]} }));
        var error;
        return process([doc])
          .catch(function(e) {
            error = e;
          })
          .finally(function() {
            expect(error).toBeUndefined();
            expect(log.error).toHaveBeenCalled();
          });
      });

      it("should continue to process the subsequent processors after a bad-processor if stopOnError is false", function() {
        var testDocs = [];
        var checkProcessor = {
          name: 'checkProcessor',
          process: function(docs) {
            expect(docs).toBe(testDocs);
            checkProcessor.called = true;
          }
        };
        process = docProcessorFactory(new Config({
          processing: {
            stopOnError: false,
            processors: [ badProcessor, checkProcessor ]
          }
        }));

        return process(testDocs).finally(function() {
          expect(checkProcessor.called).toEqual(true);
        });
      });
    });
  });

  it("should order the processors by dependency", function() {
    var log = [], docs = { content: 'x' };
    var config = new Config({ processing: {
      processors: [
        { name: 'a', runAfter: ['c'], process: function(docs) { log.push('a'); } },
        { name: 'b', runAfter: ['c','e','a'], process: function(docs) { log.push('b'); } },
        { name: 'c', runBefore: ['e'], process: function(docs) { log.push('c'); } },
        { name: 'd', runAfter: ['a'], process: function(docs) { log.push('d'); } },
        { name: 'e', runAfter: [], process: function(docs) { log.push('e'); } }
      ]
    } });
    var process = docProcessorFactory(config);
    return process(docs).then(function(docs) {
      expect(log).toEqual(['c', 'e', 'a', 'b', 'd']);
    }).done();
  });

});
