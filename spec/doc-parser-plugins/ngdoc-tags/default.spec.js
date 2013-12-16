var paramTagProcessor = require('../../../lib/doc-parser-plugins/ngdoc-tags/default');

function createTag(name, text) {
  return { name: name, text: text};
}

describe("default tag", function() {
  it("should add a property to the doc based on the tag name", function() {
    var tag = createTag('foo', 'bar');
    var doc = {};
    paramTagProcessor(tag, doc);
    expect(doc.foo).toEqual('bar');
  });
});

