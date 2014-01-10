var tags = require('../../processors/doctrine-tag-parser');
var doctrine = require('doctrine');

describe("get-tag", function() {
  it("should get the specified tag from the tags collection", function() {
    var doc = { tags: [ {title: 'a', description: 'description of a'}, { title: 'b', description: 'description of b'}] };
    expect(tags.getTag(doc.tags, 'a')).toEqual({title: 'a', description: 'description of a'});
    expect(tags.getTag(doc.tags, 'b')).toEqual({title: 'b', description: 'description of b'});
    expect(tags.getTag(doc.tags, 'c')).toEqual(null);
  });
});

describe("get-type", function() {
  it("should convert a simple type into an object", function() {
    var tag = doctrine.parse('@param string abc').tags[0];
    expect(tags.getType(tag)).toEqual({
      description: 'string',
      optional: false,
      typeList: ['string']
    });
  });

  it("should convert an optional type into an object", function() {
    var tag = doctrine.parse('@param string= abc').tags[0];
    expect(tags.getType(tag)).toEqual({
      description: 'string',
      optional: true,
      typeList: ['string']
    });
  });

  it("should convert a union type into an object", function() {
    var tag = doctrine.parse('@param function(*)|string|Array.<(function(*)|string)> abc').tags[0];
    expect(tags.getType(tag)).toEqual({
      description: '(function (*)|string|Array.<(function (*)|string)>)',
      optional: false,
      typeList: [
        'function (*)',
        'string',
        'Array.<(function (*)|string)>'
      ]
    });
  });
});