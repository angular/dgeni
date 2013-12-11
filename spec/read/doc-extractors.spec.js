var docExtractors = require('../../lib/read/doc-extractors');
var srcJsContent = require('../data/srcJsFile.js');
var docsFromJsContent = require('../data/docsFromJsFile');

describe("doc-extractors", function() {
  describe("extractNgdoc", function() {
    it('should return an object containing info about the file and its contents', function() {
      expect(docExtractors.extractNgdoc('foo/bar.ngdoc', 'A load of content')).toEqual([{
        content: 'A load of content',
        file: 'foo/bar.ngdoc',
        id: 'bar',
        type: 'ngdoc'
      }]
      );
    });
  });

  describe("extractDocsFromJs", function() {
    it('should return an object containing info about the file and its contents', function() {
      var docs = docExtractors.extractDocsFromJs('some/file.js', srcJsContent);
      docs.length = 3;
      expect(docs[0]).toEqual(docsFromJsContent[0]);
      expect(docs[1]).toEqual(docsFromJsContent[1]);
      expect(docs[2]).toEqual(docsFromJsContent[2]);
    });
  });
});

