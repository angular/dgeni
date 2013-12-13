var tagProcessor = require('../../lib/ngdoc-tags/returns');

function createTag(name, text) {
  return { name: name, text: text};
}

describe("returns tag", function() {

  it("should throw an error if the tag is badly formatted", function() {
    var tag = createTag('returns', 'some returns info');
    var doc = {};
    expect(function() { tagProcessor(tag, doc); }).toThrow();
  });      

  it("should add an returns and eventTarget returns to the doc", function() {
    var tag = createTag('returns', '{string} description of returns');
    var doc = {};
    tagProcessor(tag, doc);
    expect(doc.returns).toEqual({
      type: 'string',
      description: 'description of returns'
    });
  });

});

describe("return tag", function() {

  it("should throw an error if the tag is badly formatted", function() {
    var tag = createTag('return', 'some returns info');
    var doc = {};
    expect(function() { tagProcessor(tag, doc); }).toThrow();
  });      

  it("should add an returns and eventTarget returns to the doc", function() {
    var tag = createTag('return', '{string} description of return');
    var doc = {};
    tagProcessor(tag, doc);
    expect(doc.returns).toEqual({
      type: 'string',
      description: 'description of return'
    });
  });

});
