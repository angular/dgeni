var rewire = require('rewire');
var docParser = rewire('../../lib/parse/doc-parser');
var docsFromJsFile = require('../data/docsFromJsFile');

describe("doc-parser", function() {

  describe("getShortName", function() {
    it("should pull the last segment off the document name", function() {
      var getShortName = docParser.__get__('getShortName');
      expect(getShortName({ name: 'angular.injector'})).toBe('angular.injector');
      expect(getShortName({ name: 'ng/directive/input/email'})).toBe('email');
    });
  });

  describe("getId", function() {
    it("should use the id if provided or default to name", function() {
      var getId = docParser.__get__('getId');
      expect(getId({ id: 'some/id', name: 'some/name'})).toBe('some/id');
      expect(getId({ name: 'some/name'})).toBe('some/name');
    });
  });

  describe("getModuleName", function() {
    it("should pull the first segment off the document id", function() {
      var getModuleName = docParser.__get__('getModuleName');
      expect(getModuleName({ id: 'some/name'})).toBe('some');
      expect(getModuleName({ id: 'x.y'})).toBe('x');
    });
    it("should convert 'angular' to 'ng'", function() {
      var getModuleName = docParser.__get__('getModuleName');
      expect(getModuleName({ id: 'angular.thing'})).toBe('ng');
    });
  });


  describe("processTag", function() {
    var processTag, doc, line;
    function createTag(name, text) {
      return { name: name, text: [text]};
    }

    beforeEach(function() {
      processTag = docParser.__get__('processTag');
      doc = { file: 'file.js', params: [], pageClassName:'api' };
      line = 'some line of text from the doc';
    });

    describe("param", function() {
      it("should throw an error if there tag is badly formatted", function() {
        var tag = createTag('param', '{missing end brace from param tag');
        expect(function() { processTag(tag, doc, line); }).toThrow();
      });

      it("should add a params object to the doc", function() {
        var tag = createTag('param', '{string} paramName description text');
        processTag(tag, doc);
        expect(doc.params.length).toEqual(1);
        expect(doc.params[0]).toEqual({
          name: 'paramName',
          description: '<div class="api"><p>description text</p>\n</div>',
          type: 'string',
          optional: false,
          default: undefined
        });
      });
    });

    describe("returns", function() {
      
    });

    describe("requires", function() {
      
    });

    describe("property", function() {
      
    });

    describe("eventType", function() {
      
    });
  });

  describe("initDoc", function() {
    
  });

  describe("updateMetaData", function() {
    
  });

  xdescribe("parse", function() {
    it("should parse the contents and extract the data from the @ tags", function() {
      var parsedDoc = docParser(docsFromJsFile[0]);
      expect(parsedDoc.file);
    });
  });
});