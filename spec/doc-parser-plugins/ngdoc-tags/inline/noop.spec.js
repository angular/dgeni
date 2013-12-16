var inlineTag = require('../../../../lib/doc-parser-plugins/ngdoc-tags/inline/noop');

describe("noop ngdoc inline tag", function() {
  it("should just return the original tag", function() {
    expect(inlineTag({}, 'unknown', 'other information in the tag')).toEqual('{@unknown other information in the tag}');
  });
});