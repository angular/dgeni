var tagProcessor = require('../../lib/ngdoc-tags/property');

function createTag(name, text) {
  return { name: name, text: text};
}

describe("property tag", function() {

  it("should throw an error if the tag is badly formatted", function() {
    var tag = createTag('property', 'some property info');
    var doc = {};
    expect(function() { tagProcessor(tag, doc); }).toThrow();
  });      

  it("should add a property object to the properties property on the doc", function() {
    var tag = createTag('property', '{string} propertyName description of property');
    var doc = {};
    tagProcessor(tag, doc);
    expect(doc.properties[0]).toEqual({
      type: 'string',
      name: 'propertyName',
      shortName: 'propertyName',
      description: 'description of property'
    });
  });

});
