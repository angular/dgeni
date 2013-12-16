var tagProcessor = require('../../../lib/ngdoc-parser/ngdoc-tags/requires');

function createTag(name, text) {
  return { name: name, text: text};
}

describe("requires tag", function() {

  it("should add an object to the requires collection on the doc", function() {
    var tag = createTag('requires', 'requiresName description of requires');
    var doc = {};
    tagProcessor(tag, doc);
    expect(doc.requires).toEqual([{
      name: 'requiresName',
      text: 'description of requires'
    }]);
  });

});
