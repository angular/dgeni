var rewire = require('rewire');
var docParser = rewire('../lib/doc-parser');

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
});