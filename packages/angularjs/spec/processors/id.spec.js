var plugin = require('../../processors/id');
var PartialNames = require('../../../../lib/utils/partial-names').PartialNames;

describe("id doc processor", function() {
  var partialNames;

  beforeEach(function() {
    partialNames = new PartialNames();
  });

  it("should add partialNames to the injectables", function() {
    var injectables = createSpyObj('injectables', ['value']);
    plugin.init({}, injectables);
    expect(injectables.value).toHaveBeenCalledWith('partialNames', jasmine.any(PartialNames));
  });


  it("should compute the id of a js file from other properties", function() {
    var doc1 = {
      fileType: 'js',
      module: 'ngRoute',
      docType: 'directive',
      name: 'ngView'
    };

    var doc2 = {
      fileType: 'js',
      module: 'ng',
      name: '$http#get',
      docType: 'method'
    };

    var doc3 = {
      fileType: 'js',
      module: 'ng',
      name: 'ng',
      docType: 'module'
    };

    plugin.process([doc1, doc2, doc3], partialNames);
    expect(doc1.id).toEqual('module:ngRoute.directive:ngView');
    expect(doc2.id).toEqual('module:ng.method:$http#get');
    expect(doc3.id).toEqual('module:ng');

  });


  it("should compute the id of a non-js file from the name or file", function() {
    var doc1 = {
      fileType: 'ngdoc',
      name: 'foo.bar',
      file: 'guide/abc.ngdoc'
    };

    var doc2 = {
      fileType: 'ngdoc',
      file: 'guide/abc.xyz.ngdoc'
    };

    var doc3 = {
      fileType: 'ngdoc',
      file: 'guide/index.ngdoc'
    };

    plugin.process([doc1, doc2, doc3], partialNames);

    expect(doc1.id).toEqual('abc');
    expect(doc2.id).toEqual('abc.xyz');
    expect(doc3.id).toEqual('guide');
  });

  describe("partialNames", function() {
    var doc1, doc2, doc3;

    beforeEach(function() {
      doc1 = {
        fileType: 'js',
        module: 'ngMock',
        docType: 'service',
        name: '$log'
      };

      doc2 = {
        fileType: 'js',
        module: 'ng',
        docType: 'service',
        name: '$log'
      };

      doc3 = {
        fileType: 'ngdoc',
        file: 'guide/foo.bar.ngdoc',
      };

    });

    it("should compute all partial names for the doc and add them to the doc", function() {
      plugin.process([doc1], partialNames);
      expect(doc1.partialNames).toEqual([
        '$log',
        'service:$log',
        'ngMock.$log',
        'module:ngMock.$log',
        'ngMock.service:$log',
        'module:ngMock.service:$log'
      ]);
    });

    it("should add all partial names to the partialNames map", function() {
      plugin.process([doc1], partialNames);
      expect(partialNames.map).toEqual({
        '$log': doc1,
        'service:$log': doc1,
        'ngMock.$log': doc1,
        'module:ngMock.$log': doc1,
        'ngMock.service:$log': doc1,
        'module:ngMock.service:$log': doc1
      });

      plugin.process([doc2], partialNames);
      expect(partialNames.map).toEqual({
        '$log': [doc1, doc2],
        'service:$log': [doc1, doc2],
        'ngMock.$log': doc1,
        'module:ngMock.$log': doc1,
        'ngMock.service:$log': doc1,
        'module:ngMock.service:$log': doc1,
        'ng.$log': doc2,
        'module:ng.$log': doc2,
        'ng.service:$log': doc2,
        'module:ng.service:$log': doc2
       });

      plugin.process([doc3], partialNames);
      expect(partialNames.map).toEqual({
        '$log': [doc1, doc2],
        'service:$log': [doc1, doc2],
        'ngMock.$log': doc1,
        'module:ngMock.$log': doc1,
        'ngMock.service:$log': doc1,
        'module:ngMock.service:$log': doc1,
        'ng.$log': doc2,
        'module:ng.$log': doc2,
        'ng.service:$log': doc2,
        'module:ng.service:$log': doc2,
        'foo.bar': doc3
       });
    });
  });
});