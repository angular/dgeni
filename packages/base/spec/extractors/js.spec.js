var jsExtractor = require('../../extractors/js');

var srcJsContent = require('./_test-data/srcJsFile.js');
var docsFromJsContent = require('./_test-data/docsFromJsFile');

describe("js doc extractor", function() {
  describe("pattern", function() {
    it("should only match js files", function() {
      expect(jsExtractor.pattern.test('abc.js')).toBeTruthy();
      expect(jsExtractor.pattern.test('abc.ngdoc')).toBeFalsy();
    });
  });
  describe("process", function() {
    it('should return a collection of documents extracted from the file', function() {
      var docs = jsExtractor.processFile('some/file.js', srcJsContent);
      docs.length = 3;
      expect(docs[0]).toEqual(docsFromJsContent[0]);
      expect(docs[1]).toEqual(docsFromJsContent[1]);
      expect(docs[2]).toEqual(docsFromJsContent[2]);
    });
  });
});