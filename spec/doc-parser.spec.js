var rewire = require('rewire');
var docParser = rewire('../lib/doc-parser');
var docsFromJsFile = require('./data/docsFromJsFile');

describe("doc-parser", function() {

  describe("addMetaData", function() {
    var addMetaData, doc;
    beforeEach(function() {
      addMetaData = docParser.__get__('addMetaData');
    });

    it("should use doc.id if provided or default to doc.name", function() {
      doc = { id: 'some/id', name: 'some/name'};
      addMetaData(doc);
      expect(doc.id).toBe('some/id');

      doc = { name: 'some/name'};
      addMetaData(doc);
      expect(doc.id).toBe('some/name');
    });

    it('should calculate the path of an ngdoc document', function() {
      doc = { fileType: 'ngdoc', folder: 'a/b/c'};
      addMetaData(doc);
      expect(doc.path).toEqual('a/b/c');
    });

    it('should calculate properties for a js document', function() {
      doc = { fileType: 'js', name: 'x/y/z'};
      addMetaData(doc);
      expect(doc.path).toEqual('api/x/y/z');
      expect(doc.moduleName).toEqual('x');
      expect(doc.shortName).toEqual('z');
    });

    it("should convert 'angular' to 'ng'", function() {
      doc = { fileType: 'js', name: 'angular.abc'};
      addMetaData(doc);
      expect(doc.moduleName).toEqual('ng');
    });
  });


  xdescribe("processTag", function() {
    var processTag, doc, line;

    function createTag(name, text) {
      return { name: name, text: [text]};
    }

    beforeEach(function() {
      processTag = docParser.__get__('processTag');
      doc = { file: 'file.js', params: [], pageClassName:'api' };
      line = 'some line of text from the doc';
    });

    describe("param tag", function() {
      it("should throw an error if the tag is badly formatted", function() {
        var tag = createTag('param', '{missing end brace from param tag');
        expect(function() { processTag(tag, doc, line); }).toThrow();
      });

      it("should add a params object to the doc", function() {
        var tag = createTag('param', '{string} paramName description text');
        processTag(tag, doc);
        expect(doc.params.length).toEqual(1);
        expect(doc.params[0]).toEqual({
          name: 'paramName',
          description: 'description text',
          type: 'string',
          optional: false,
          default: undefined
        });
      });
    });

    describe("returns/return tag", function() {
      it("should throw an error if the tag is badly formatted", function() {
      });      
      it("should add a XXX object to the doc", function() {
      });
    });

    describe("requires tag", function() {
      it("should throw an error if the tag is badly formatted", function() {
      });      
      it("should add a XXX object to the doc", function() {
      });
    });

    describe("property tag", function() {
      it("should throw an error if the tag is badly formatted", function() {
      });      
      it("should add a XXX object to the doc", function() {
      });
    });

    describe("eventType tag", function() {
      it("should throw an error if the tag is badly formatted", function() {
      });      
      it("should add a XXX object to the doc", function() {
      });
    });

    describe("other tags", function() {

    })
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