require('q-io/spec/lib/jasmine-promise');
var rewire = require('rewire');
var MockFs = require('q-io/fs-mock');

describe("doc-writer", function() {
  var writer, mockFs;

  beforeEach(function() {
    mockFs = new MockFs({
      'src':{
        'a.js': 'a b c',
        'b.js': 'x y z'
      }
    });

    // Reset the writer before each test
    writer = rewire('../../lib/utils/doc-writer');
    writer.__set__('fs', mockFs);
  });

  describe('exports', function() {
    describe("writeFile", function() {
      it("should create the folder structure as needed", function() {
        return writer.writeFile('build/foo/bar.js', 'a b c')

        .then(function() {
          return mockFs.read('build/foo/bar.js').then(function(content) {
            expect(content).toEqual('a b c');
          });
        })

        .then(function() {
          return mockFs.exists('build/foo/bar.js').then(function(exists) {
            expect(exists).toBe(true);
          });
        });
      });
    });

    describe("copyFile", function() {
      it("should create the folder structure as needed", function() {
        return writer.copyFile('src/a.js', 'build/foo/bar.js')

        .then(function() {
          return mockFs.exists('build/foo/bar.js').then(function(exists) {
            expect(exists).toBe(true);
          });
        });
      });

      it('should apply replacements if provided', function() {
        var replacements = { a: 'x', b: 'y', c: 'z'};

        return writer.copyFile('src/a.js', 'build/x.js', replacements)

        .then(function() {
          return mockFs.read('build/x.js').then(function(content) {
            expect(content).toEqual('x y z');
          });
        });
      });
    });

    describe("linkFile", function() {
      it("should create the folder structure as needed", function() {
        return writer.linkFile('src/a.js', 'build/foo/bar.js')

        .then(function() {
          return mockFs.isSymbolicLink('build/foo/bar.js').then(function(exists) {
            expect(exists).toBe(true);
          });
        });
      });
    });

    describe("linkFolder", function() {
      it("should create the folder structure as needed", function() {
        return writer.linkFile('src', 'build/foo')

        .then(function() {
          return mockFs.isSymbolicLink('build/foo').then(function(exists) {
            expect(exists).toBe(true);
          });
        })

        .then(function() {
          return mockFs.readLink('build/foo').then(function(path) {
            expect(path).toBe(mockFs.resolve('../src'));
          });
        });

      });
    });
  });

  describe("private helpers", function() {
    describe('stringify', function() {
      var stringify;

      beforeEach(function() {
        stringify = writer.__get__('stringify');
      });

      it('should simply return a string as-is', function() {
        expect(stringify('abc')).toEqual('abc');
      });

      it('should flatten an object into string', function() {
        expect(stringify({a:1})).toEqual('{"a":1}');
      });

      it('should concatenate array items into a string', function() {
        expect(stringify(['abc',{}])).toEqual('abc{}');
      });
    });

    describe('replaceContent method', function() {
      var replaceContent;

      beforeEach(function() {
        replaceContent = writer.__get__('replaceContent');
      });

      it('should replace placeholders', function() {
        var content = 'angular super jQuery manifest';
        var replacements = {'angular': 'ng', 'jQuery': 'jqlite','notHere': 'here'};
        expect(replaceContent(content, replacements)).toBe('ng super jqlite manifest');
      });
    });
  });

});