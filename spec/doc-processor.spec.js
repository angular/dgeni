var Q = require('q');
var docProcessorFactory = require('../lib/doc-processor');
var tagParser = jasmine.createSpyObj('tagParser', ['parse', 'getTags']);
var tagDefs = [];
var log = require('winston');
var Config = require('../lib/config');

describe("doc-processor", function() {

  it("should throw error if the processors are invalid", function() {
    expect(function() {
      docProcessorFactory();
    }).toThrow();

    expect(function() {
      docProcessorFactory([]);
    }).toThrow();
  });

  it("should throw error if the config is defined but not an instance of Config", function() {
    expect(function() {
      docProcessorFactory([{}], {}, { configProp: 'value' });
    }).toThrow();
  });

  it("should add extraData and injector to the injectables", function(done) {
    var injected = {};
    var process = docProcessorFactory([
      {
        name: 'injectables-test', process: function(extraData, injector) {
          injected.extraData = extraData;
          injected.injector = injector;
        }
      }
    ]);
    process([{}]).then(function() {
      expect(injected.extraData).toEqual(jasmine.any(Object));
      expect(injected.injector).toEqual(jasmine.any(Object));
      done();
    });
  });

  it("should add services to the di module", function(done) {
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
    return processDocs([]).finally(function() {
      expect(log).toEqual(['service1 value', 'service1 value service2 value']);
      done();
    });
  });

  it("should call each of the processors in turn, passing the docs object to each", function(done) {
    var log = [], docs = [ { content: 'a'}, { content: 'b'}];
    before = { name: 'before', process: function(docs) { log.push('before'); } };
    middle = { name:'middle', process: function(docs) { log.push('middle'); } };
    after = { name: 'after', process: function(docs) { log.push('after'); } };


    var processors = [before, middle, after];

    var process = docProcessorFactory(processors);
    return process(docs).finally(function(docs) {
      expect(log).toEqual(['before', 'middle', 'after']);
      expect(docs).toEqual(docs);
      done();
    });
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

    describe('config: processing.stopOnError', function(done) {

      it("should fail if stopOnError is true a processor throws an Error", function() {
        process = docProcessorFactory([badProcessor], {}, new Config({ processing: {stopOnError: true} }));
        var error;
        process([doc])
          .catch(function(e) {
            expect(e).toBeDefined();
            done();
          });
      });

      it("should not fail but log the error if stopOnError is false a processor throws an Error", function(done) {
        process = docProcessorFactory([badProcessor], new Config({ processing: {stopOnError: false} }));
        var error;
        spyOn(log, 'error');
        process([doc])
          .catch(function(e) {
            error = e;
          })
          .finally(function() {
            expect(error).toBeUndefined();
            expect(log.error).toHaveBeenCalled();
            done();
          });
      });

      it("should continue to process the subsequent processors after a bad-processor if stopOnError is false", function(done) {
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
          done();
        });
      });
    });
  });
});
