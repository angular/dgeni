var Q = require('q');
var MockFS = require('q-io/fs-mock');
var rewire = require('rewire');
var fileReaderFactory = rewire('../../lib/doc-extractor');

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
fileReaderFactory.__set__('fs', fs);

var mockNgDocExtractor = {
  pattern: /\.ngdoc$/,
  processFile: function(file, content) {
    return [{ content: content, file: file, fileType: 'ngdoc' }];
  }
};

var mockJsExtractor = {
  pattern: /\.js$/,
  processFile: function(file, content) {
    return [{ content: content, file: file, fileType: 'js' }];
  }
};

describe('doc-extractor', function() {

  it('should traverse the specified folder tree, reading each matching file', function() {

    var readFiles = fileReaderFactory([mockNgDocExtractor]);
    readFiles('./docs').then(function(docs) {
      expect(docs.length).toEqual(1);
      expect(docs[0]).toEqual({
        file: "docs/b.ngdoc",
        content: "mock documentation file",
        fileType: 'ngdoc'
      });
    });

    readFiles = fileReaderFactory([mockJsExtractor]);
    readFiles('./src').then(function(docs) {
      expect(docs.length).toEqual(2);
      expect(docs[0]).toEqual({
        file: "src/a.js",
        content: "// Mock code file",
        fileType: 'js'
      });
      expect(docs[1]).toEqual({
        file: "src/b.js",
        content: "// Other mock code file",
        fileType: 'js'
      });
    });
  });
});