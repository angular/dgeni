var doctrine = require('doctrine');
var rewire = require('rewire');
var plugin = rewire('../../processors/doctrine-tag-parser');
var Tags = plugin.__get__('Tags');

describe("doctrine-tag-parser doc processor plugin", function() {
  it("should have name 'doctrine-tag-parser", function() {
    expect(plugin.name).toEqual('doctrine-tag-parser');
  });
  it("should parse the content of the document with Doctrine and attach a Tags object to the doc", function() {
    var doc = {
      content: 'some content\n@ngdoc directive\n@description Some description info\n'
    };
    plugin.before([doc]);
    expect(doc.tags).toBeDefined();
    expect(doc.tags.getTag('ngdoc')).toEqual({ title: 'ngdoc', description: 'directive' });
    expect(doc.tags.getTag('description')).toEqual({ title: 'description', description: 'some content\nSome description info' });
  });
});

describe('Tags', function() {
  describe("get-tag", function() {
    it("should get the specified tag from the tags collection", function() {
      var tags = new Tags('@a description of a\n@b description of b');
      expect(tags.getTag('a')).toEqual({title: 'a', description: 'description of a'});
      expect(tags.getTag('b')).toEqual({title: 'b', description: 'description of b'});
      expect(tags.getTag('c')).toEqual(null);
    });
  });

  describe("get-type", function() {
    it("should convert a simple type into an object", function() {
      var tag = doctrine.parse('@param string abc').tags[0];
      expect(Tags.prototype.getType(tag)).toEqual({
        description: 'string',
        optional: false,
        typeList: ['string']
      });
    });

    it("should convert an optional type into an object", function() {
      var tag = doctrine.parse('@param string= abc').tags[0];
      expect(Tags.prototype.getType(tag)).toEqual({
        description: 'string',
        optional: true,
        typeList: ['string']
      });
    });

    it("should convert a union type into an object", function() {
      var tags = new Tags('@param function(*)|string|Array.<(function(*)|string)> abc');
      expect(tags.getType(tags.getTag('param'))).toEqual({
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
});