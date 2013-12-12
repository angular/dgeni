var contentParserFactory = require('../lib/content-parser');

describe("content-parser", function() {
  var parseContent, spyParser;

  beforeEach(function() {
    spyParser = jasmine.createSpy('spyParser').andCallFake(function(text) { return text; });
    parseContent = contentParserFactory([spyParser]);
  });

  it("should return null / undefined if null / undefined is passed as text param", function() {
    expect(parseContent(null)).toBe(null);
    expect(parseContent(undefined)).toBeUndefined();
  });

  it("should call the spyParser", function() {
    expect(parseContent('xxx')).toEqual('xxx');
    expect(spyParser).toHaveBeenCalled();
  });

  it("should trim indentation", function() {
    expect(parseContent('  xxx\n    yyy\n   zzz')).toEqual('xxx\n  yyy\n zzz');
  });

  it("should store placeholders", function() {
    var id;
    var storePlaceholderParser = function(text, doc, placeholders) {
      id = placeholders.add('xxx');
    };
    var getPlaceholderParser = function(text, doc, placeholders) {
      return placeholders.get(id);
    };
    parseContent = contentParserFactory([storePlaceholderParser, getPlaceholderParser]);
    expect(parseContent('yyy')).toEqual('xxx');
    expect(id).toEqual('REPLACEME0');
  });
});