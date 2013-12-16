var pluginFactory = require('../../../lib/doc-processor/doc-processor-plugins/ngdoc-parser');

describe("ngdoc-parser plugin", function() {
    it("should call the parser for each doc", function() {
      var parser = jasmine.createSpy('parser').andCallFake(function(doc) { return doc; });
      var plugin = pluginFactory(parser);
      var docs = [ {}, {}, {}];
      expect(plugin(docs)).toEqual(docs);
      expect(parser).toHaveBeenCalled();
      expect(parser.calls.length).toEqual(3);
    });
});