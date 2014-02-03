var Q = require('q');
var MockFS = require('q-io/fs-mock');
var rewire = require('rewire');
var plugin = rewire('../../processors/doc-extractor');
var _ = require('lodash');

var mockFiles = {
  "docs": {
    "a.js": "// Mock code file",
    "b.ngdoc": "mock documentation file"
  },
  "src": {
    "a.js": "// Mock code file",
    "b.js": "// Other mock code file"
  }
};

plugin.__set__('fs', MockFS(mockFiles));
plugin.__set__('glob.sync', function(pattern) {
  // Strip off the "./" from the start of the pattern
  pattern = pattern.replace(/^\.\//,'');
  return _.keys(mockFiles[pattern]);
});

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

    plugin.init({ source: { extractors: [mockNgDocExtractor, mockJsExtractor], files: ['./docs', './src'] }});
    plugin.before().then(function(docs) {
      expect(docs.length).toEqual(4);
      expect(docs[0]).toEqual({
        file: "docs/a.js",
        content: "// Mock code file",
        fileType: 'js'
      });
      expect(docs[1]).toEqual({
        file: "docs/b.ngdoc",
        content: "mock documentation file",
        fileType: 'ngdoc'
      });
      expect(docs[2]).toEqual({
        file: "src/a.js",
        content: "// Mock code file",
        fileType: 'js'
      });
      expect(docs[3]).toEqual({
        file: "src/b.js",
        content: "// Other mock code file",
        fileType: 'js'
      }).done();
    });

  });
});