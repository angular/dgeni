var DocGenerator = require('../lib/doc-generator');
var Package = require('../lib/package');

describe("DocGenerator", function() {
  var docGenerator;

  beforeEach(function() {
    docGenerator = new DocGenerator();
  });

  describe("package", function() {
    it("should add the package to the packages property", function() {
      docGenerator.package(new Package('test-package'));
      expect(docGenerator.packages['test-package']).toEqual(new Package('test-package'));
    });
    it("should create a new package if passed a string", function() {
      var newPackage = docGenerator.package('test-package');
      expect(newPackage instanceof Package).toBeTruthy();
    });
    it("should throw an error if the not passed an instance of Package or a string name", function() {
      expect(function() {
        docGenerator.usePackage({});
      }).toThrow();
    });
  });

  describe("generate", function() {

  });

});