var Q = require('q');
var path = require('path');
var MockFS = require('q-io/fs-mock');
var rewire = require('rewire');
var srcReader = rewire('../../lib/read/src-reader');

var fs = MockFS({
  "docs": {
    "a.js": "// Mock code file",
    "b.ngdoc": "mock documentation file"
  },
  "src": {
    "a.js": "// Mock code file",
    "b.js": "// Other mock code file"
  }
});

srcReader.__set__('fs', fs);

function processFile(file, content) {
  return {
    content: content,
    file: file
  };
}

describe('src-reader', function() {

  describe('readDocs', function() {
    it('should traverse the specified folder tree, reading each matching file', function() {
      srcReader.readDocs('./docs', /\.ngdoc$/, processFile).then(function(docs) {
        expect(docs.length).toEqual(1);
        expect(docs[0]).toEqual({
          file: path.normalize("docs/b.ngdoc"),
          content: "mock documentation file"
        });
      });

      srcReader.readDocs('./src', /\.js$/, processFile).then(function(docs) {
        expect(docs.length).toEqual(2);
        expect(docs[0]).toEqual({
          file: path.normalize("src/a.js"),
          content: "// Mock code file"
        });
        expect(docs[1]).toEqual({
          file: path.normalize("src/b.js"),
          content: "// Other mock code file"
        });
      });
    });
  });
});