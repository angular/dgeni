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
    it("should add services from packages in the correct package dependency order", function(done) {
      var log = [];
      docGenerator.package('test1', ['test2'])
        .service('testValue', function() { return 'test 1'; });
      docGenerator.package('test2')
        .service('testValue', function() { return 'test 2'; });
      docGenerator.package('test3', ['test1', 'test2'])
        .processor({
          name: 'test3-processor',
          process: function(testValue) { log.push(testValue); }
        });
      return docGenerator.generate().then(function() {
        expect(log).toEqual(['test 1']);
        done();
      });
    });


    it("should run the config functions in the correct package dependency order", function(done) {
      var log = [];
      docGenerator.package('test1', ['test2'])
        .config(function(config) { config.set('testValue', 1); });
      docGenerator.package('test2')
        .config(function(config) { config.set('testValue', 2); });
      docGenerator.package('test3', ['test1', 'test2'])
        .processor({
          name: 'test3-processor',
          process: function(config) { log.push(config.get('testValue')); }
        });
      return docGenerator.generate().then(function() {
        expect(log).toEqual([1]);
        done();
      });
    });
  });

});