var rewire = require('rewire');
var plugin = rewire('../../processors/doctrine-tag-extractor');

describe("doctrine-tag-extractor doc processor plugin", function() {
  it("should have name 'doctrine-tag-extractor", function() {
    expect(plugin.name).toEqual('doctrine-tag-extractor');
  });

  it("should error if no valid config is provided", function() {
    expect(function() { plugin.init(); }).toThrow();
  });

  it("should call extractTags on the document", function() {
    var doc = {};
    plugin.init({ processing: { tagDefinitions: [] } });
    var extractTagsSpy = jasmine.createSpy('extractTags');
    plugin.__set__('extractTags', extractTagsSpy);
    plugin.process([doc]);
    expect(extractTagsSpy).toHaveBeenCalledWith(doc);
  });
});