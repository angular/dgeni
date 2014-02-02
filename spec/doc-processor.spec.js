var Q = require('q');
var docProcessorFactory = require('../lib/doc-processor');
var tagParser = jasmine.createSpyObj('tagParser', ['parse', 'getTags']);
var tagDefs = [];

describe("doc-processor", function() {

  it("should throw error if the config is invalid", function() {
    expect(function() {
      docProcessorFactory({});
    }).toThrow('Invalid config - you must provide a config object with a "processing" property');
  });

  it("should call each of the processors in turn, passing the docs object to each", function() {
    var log = [], docs = [ { content: 'a'}, { content: 'b'}];
    before = { name: 'before', before: function(docs) { log.push('before'); return docs; } };
    each = { name:'each', each: function(doc) { log.push('each:' + doc.content); } };
    after = { name: 'after', after: function(docs) { log.push('after'); return docs; } };


    var config = {
      processing: {
        processors: [before, each, after]
      }
    };

    var process = docProcessorFactory(config);
    return process(docs).then(function(docs) {
      expect(log).toEqual(['before', 'each:a', 'each:b', 'after']);
      expect(docs).toEqual(docs);
    }).done();
  });

  // AGH this is a pain to test when async...
  describe("bad-processor", function() {
    var process, doc;

    beforeEach(function() {
      var badProcessor = {
        name: 'bad-processor',
        each: function() { throw new Error('processor failed'); }
      };
      process = docProcessorFactory({ processing: { processors: [badProcessor]} });
      doc = {};
    });

    it("should wrap exceptions thrown by processors", function() {
      return process([doc]).then(function() {
        throw 'Expected an error.';
      }, function() {
        return 'Error caught';
      }).then(function(result) {
        expect(result).toEqual('Error caught');
      });
    });
  });

  it("should order the processors by dependency", function() {
    var log = [], docs = { content: 'x' };
    var config = { processing: {
      processors: [
        { name: 'a', runAfter: ['c'], each: function(doc) { log.push('a'); } },
        { name: 'b', runAfter: ['c','e','a'], each: function(doc) { log.push('b'); } },
        { name: 'c', runBefore: ['e'], each: function(doc) { log.push('c'); } },
        { name: 'd', runAfter: ['a'], each: function(doc) { log.push('d'); } },
        { name: 'e', runAfter: [], each: function(doc) { log.push('e'); } }
      ]
    } };
    var process = docProcessorFactory(config);
    return process(docs).then(function(docs) {
      expect(log).toEqual(['c', 'e', 'a', 'b', 'd']);
    }).done();
  });

});
