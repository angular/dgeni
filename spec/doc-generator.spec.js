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
    it("should pass dependencies through to the new package", function() {
      var newPackage = docGenerator.package('test-package', ['dep1', 'dep2']);
      expect(newPackage.dependencies).toEqual(['dep1', 'dep2']);
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
      docGenerator.generate()
        .then(function() {
          expect(log).toEqual(['test 1']);
        })
        .finally(done);
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
      docGenerator.generate()
        .then(function() {
          expect(log).toEqual([1]);
        })
        .finally(done);
    });


    it("should order the processors by dependency", function(done) {
      var log = [];
      docGenerator.package('test1')
        .processor({ name: 'a', runAfter: ['c'], process: function(docs) { log.push('a'); } })
        .processor({ name: 'b', runAfter: ['c','e','a'], process: function(docs) { log.push('b'); } })
        .processor({ name: 'c', runBefore: ['e'], process: function(docs) { log.push('c'); } })
        .processor({ name: 'd', runAfter: ['a'], process: function(docs) { log.push('d'); } })
        .processor({ name: 'e', runAfter: [], process: function(docs) { log.push('e'); } });
      docGenerator.generate()
        .finally(function(docs) {
          expect(log).toEqual(['c', 'e', 'a', 'b', 'd']);
          done();
        });
    });

    it("should throw an error if the processor dependencies are invalid", function() {
      expect(function() {
        docGenerator.package('test')
          .processor({ name: 'bad-runAfter-processor', runAfter: 'tags-processed' });
        docGenerator.generate();
      }).toThrow();

      expect(function() {
        docGenerator.package('test')
          .processor({ name: 'bad-runBefore-processor', runBefore: 'tags-processed' });
        docGenerator.generate();
      }).toThrow();

    });
  });
});