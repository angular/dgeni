var paramTagProcessor = require('../../../lib/ngdoc-parser/ngdoc-tags/param');

function createTag(name, text) {
  return { name: name, text: text};
}

describe("param tag", function() {
  var doc = { file: 'file.js' };

  it("should throw an error if the tag is badly formatted", function() {
    var tag = createTag('param', '{missing end brace from param tag');
    expect(function() { paramTagProcessor(tag, doc); }).toThrow();
  });

  it("should add a params object to the doc", function() {
    var tag = createTag('param', '{string} paramName description text');
    paramTagProcessor(tag, doc);
    expect(doc.params.length).toEqual(1);
    expect(doc.params[0]).toEqual({
      name: 'paramName',
      description: 'description text',
      type: 'string',
      optional: false,
      default: undefined
    });
  });
});

