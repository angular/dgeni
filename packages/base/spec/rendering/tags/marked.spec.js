var rewire = require('rewire');
var extension = rewire('../../../rendering/tags/marked');

describe("marked custom tag extension", function() {
  var markedMock;

  beforeEach(function() {
    markedMock = jasmine.createSpy('marked').andCallFake(function(str) {return str;});
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
      var trimSpy = jasmine.createSpyObj('trimSpy', ['calcIndent', 'trimIndent', 'reindent']);
      extension.__set__('trimIndentation', trimSpy);
      extension.process(null, function() { return 'some content'; });
      expect(trimSpy.calcIndent).toHaveBeenCalled();
      expect(trimSpy.trimIndent).toHaveBeenCalled();
      expect(trimSpy.reindent).toHaveBeenCalled();
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