var Q = require('q');
var docProcessorFactory = require('../lib/doc-processor');
var tagParser = jasmine.createSpyObj('tagParser', ['parse', 'getTags']);
var tagDefs = [];
var log = require('winston');
var Config = require('../lib/config').Config;

describe("doc-processor", function() {

  it("should throw error if the processors are invalid", function() {
    expect(function() {
      docProcessorFactory();
    }).toThrow();

    expect(function() {
      docProcessorFactory([]);
    }).toThrow();

    expect(function() {
      docProcessorFactory([{ name: 'bad-runAfter-processor', runAfter: 'tags-processed' }]);
    }).toThrow();

    expect(function() {
      docProcessorFactory([{ name: 'bad-runBefore-processor', runAfter: 'tags-processed' }]);
    }).toThrow();
  });

  it("should throw error if the config is defined but not an instance of Config", function() {
    expect(function() {
      docProcessorFactory([{}], {}, { configProp: 'value' });
    }).toThrow();
  });

  it("should add extraData and injector to the injectables", function() {
    var injected = {};
    var process = docProcessorFactory([
      {
        name: 'injectables-test', process: function(extraData, injector) {
          injected.extraData = extraData;
          injected.injector = injector;
        }
      }
    ]);
    process().then(function() {
      expect(injected.extraData).toBe(jasmine.any(Object));
      expect(injected.injector).toBe(jasmine.any(Object));
    });
  });

  it("should add services to the di module", function() {
    var log = [];

    var processors = [{
      name: 'test-processor',
      process: function(service1, service2) {
        log.push(service1);
        log.push(service2);
      }
    }];

    var services = {
      service1: function() { return 'service1 value'; },
      service2: function(service1) { return service1 + ' service2 value'; }
    };

    var processDocs = docProcessorFactory(processors, services);
    return processDocs([]).then(function() {
      expect(log).toEqual(['service1 value', 'service1 value service2 value']);
    });
  });

  it("should call each of the processors in turn, passing the docs object to each", function() {
    var log = [], docs = [ { content: 'a'}, { content: 'b'}];
    before = { name: 'before', process: function(docs) { log.push('before'); } };
    middle = { name:'middle', process: function(docs) { log.push('middle'); } };
    after = { name: 'after', process: function(docs) { log.push('after'); } };


    var processors = [before, middle, after];

    var process = docProcessorFactory(processors);
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
        process = docProcessorFactory([badProcessor], {}, new Config({ processing: {stopOnError: true} }));
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
        process = docProcessorFactory([badProcessor], new Config({ processing: {stopOnError: false} }));
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
            checkProcessor.docs = docs;
            checkProcessor.called = true;
          }
        };
        process = docProcessorFactory([ badProcessor, checkProcessor ], new Config({
          processing: {
            stopOnError: false
          }
        }));

        return process(testDocs).finally(function() {
          expect(checkProcessor.called).toEqual(true);
          expect(checkProcessor.docs).toBe(testDocs);
        });
      });
    });
  });

  it("should order the processors by dependency", function() {
    var log = [], docs = { content: 'x' };
    var processors = [
        { name: 'a', runAfter: ['c'], process: function(docs) { log.push('a'); } },
        { name: 'b', runAfter: ['c','e','a'], process: function(docs) { log.push('b'); } },
        { name: 'c', runBefore: ['e'], process: function(docs) { log.push('c'); } },
        { name: 'd', runAfter: ['a'], process: function(docs) { log.push('d'); } },
        { name: 'e', runAfter: [], process: function(docs) { log.push('e'); } }
      ];
    var process = docProcessorFactory(processors);
    return process(docs).then(function(docs) {
      expect(log).toEqual(['c', 'e', 'a', 'b', 'd']);
    }).done();
  });

});
