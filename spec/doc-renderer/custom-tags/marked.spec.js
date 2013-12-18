var rewire = require('rewire');
var extension = rewire('../../../lib/doc-renderer/custom-tags/marked');

describe("marked custom tag extension", function() {
  var markedMock;

  beforeEach(function() {
    markedMock = jasmine.createSpy('marked');
    extension.__set__('marked', markedMock);
  });
   
  it("should specify the tags to match", function() {
    expect(extension.tags).toEqual(['marked']);
  });

  describe("process", function() {
    
    it("should call the mock marked function when processing", function() {
      extension.process(null, function() { return 'some content'; });
      expect(markedMock).toHaveBeenCalledWith('some content');
    });

    it("should trim indentation from content", function() {
      var trimSpy = jasmine.createSpy('trimSpy');
      extension.__set__('trimIndentation', trimSpy);
      extension.process(null, function() { return 'some content'; });
      expect(trimSpy).toHaveBeenCalledWith('some content');
    });
  });

  describe("parse", function() {
    it("should interact correctly with the parser", function() {
      var log = [];
      var parserMock = {
        advanceAfterBlockEnd: function() { log.push('advanceAfterBlockEnd'); },
        parseUntilBlocks: function() { log.push('parseUntilBlocks'); return 'some content'; }
      };
      var nodesMock = {
        CallExtension: function() { log.push('CallExtension'); this.args = arguments; }
      };

      var tag = extension.parse(parserMock, nodesMock);

      expect(log).toEqual([
        'advanceAfterBlockEnd',
        'parseUntilBlocks',
        'CallExtension',
        'advanceAfterBlockEnd'
      ]);

      expect(tag.args[0]).toEqual(extension);
      expect(tag.args[1]).toEqual('process');
      expect(tag.args[3]).toEqual(['some content']);
    });
  });
});