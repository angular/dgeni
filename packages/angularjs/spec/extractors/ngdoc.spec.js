var ngdocExtractor = require('../../extractors/ngdoc');

describe("extractNgdoc", function() {
  describe("pattern", function() {
    it("should only match ngdoc files", function() {
      expect(ngdocExtractor.pattern.test('abc.ngdoc')).toBeTruthy();
      expect(ngdocExtractor.pattern.test('abc.js')).toBeFalsy();
    });
  });
  describe("process", function() {
    it('should return an object containing info about the file and its contents', function() {
      expect(ngdocExtractor.processFile('foo/bar.ngdoc', 'A load of content', 'base/path')).toEqual([{
        content: 'A load of content',
        file: 'foo/bar.ngdoc',
        fileType: 'ngdoc',
        startingLine: 1,
        basePath: 'base/path'
      }]);
    });
  });
});

