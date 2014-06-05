var Package = require('../lib/Package');

describe("Package", function() {
  describe("constructor()", function() {

    it("should complain if no name is given", function() {
      expect(function() {
        new Package();
      }).toThrow();
      expect(function() {
        new Package(['dep1', 'dep2']);
      }).toThrow();
    });

    it("should add dependencies, if provided", function() {
      var package = new Package('packageName', ['dep1', 'dep2']);
      expect(package.dependencies).toEqual(['dep1', 'dep2']);
    });

    it("should create an empty dependencies collection if no dependencies are provided", function() {
      var package = new Package('packageName');
      expect(package.dependencies).toEqual([]);
    });

    it("should complain if dependencies is not an array", function() {
      expect(function() {
        new Package('somePackage', {});
      }).toThrow();
    });
  });

  describe("processor()", function() {

    it("should add processors defined by an object to the processors property", function() {
      var package = new Package('packageName');
      package.processor({ name: 'testProcessor'});
      expect(package.processors[0]).toEqual('testProcessor');
    });

    it("should add processors defined by a factory function to the processors property", function() {
      var package = new Package('packageName');
      package.processor(function testProcessor() {});
      expect(package.processors[0]).toEqual('testProcessor');
    });

    it("should complain if the processorFactory does not have a name", function() {
      var package = new Package('packageName');
      expect(function() {
        package.processor(function() {});
      }).toThrow();

      expect(function() {
        package.processor({ missing: 'name'});
      }).toThrow();
    });

    it("should use the first param as the name if it is a string", function() {
      var package = new Package('packageName');
      package.processor('testProcessor', { $process: function(docs) { } });
      expect(package.processors[0]).toEqual('testProcessor');
    });

    it("should add the processor to the DI module", function() {
      var package = new Package('packageName');
      var count = 0;
      package.module.forEach(function() { count += 1; });
      expect(count).toEqual(0);

      package.processor(function testProcessor() {});
      package.module.forEach(function() { count += 1; });
      expect(count).toEqual(1);
    });
  });

  describe("factory()", function() {
    it("should complain if the factory is not a function", function() {
      var package = new Package('packageName');
      expect(function() {
        package.factory({ name: 'bad factory'});
      }).toThrow();
    });

    it("should complain if the factory does not have a name", function() {
      var package = new Package('packageName');
      expect(function() {
        package.factory(function() {});
      }).toThrow();
    });

    it("should use the first param as the name if it is a string", function() {
      var package = new Package('packageName');
      var count = 0;
      var testServiceFactory = function() {};
      package.factory('testService', testServiceFactory);
      package.module.forEach(function(value) {
        count += 1;
        expect(value).toEqual(['testService', 'factory', testServiceFactory]);
      });
      expect(count).toEqual(1);
    });

    it("should add the service to the DI module", function() {
      var package = new Package('packageName');
      var count = 0;
      package.module.forEach(function() { count += 1; });
      expect(count).toEqual(0);

      package.factory(function testService() {});
      package.module.forEach(function() { count += 1; });
      expect(count).toEqual(1);
    });
  });


  describe("type()", function() {
    it("should complain if the constructor is not a function", function() {
      var package = new Package('packageName');
      expect(function() {
        package.type({ name: 'bad type'});
      }).toThrow();
    });

    it("should complain if the constructor does not have a name", function() {
      var package = new Package('packageName');
      expect(function() {
        package.type(function() {});
      }).toThrow();
    });

    it("should use the first param as the name if it is a string", function() {
      var package = new Package('packageName');
      var count = 0;
      var TestService = function() {};
      package.type('testService', TestService);
      package.module.forEach(function(value) {
        count += 1;
        expect(value).toEqual(['testService', 'type', TestService]);
      });
      expect(count).toEqual(1);
    });

    it("should add the service to the DI module", function() {
      var package = new Package('packageName');
      var count = 0;
      package.module.forEach(function() { count += 1; });
      expect(count).toEqual(0);

      package.type(function TestService() {});
      package.module.forEach(function() { count += 1; });
      expect(count).toEqual(1);
    });
  });


  describe("config()", function() {
    it("should add the function to the configFns property", function() {
      var package = new Package('packageName');
      var testFn = function() {};
      package.config(testFn);
      expect(package.configFns[0]).toEqual(testFn);
    });

    it("should complain if configFn is not a function", function() {
      var package = new Package('packageName');
      expect(function() {
        package.config({ some: 'non-function'});
      }).toThrow();
    });

  });

});