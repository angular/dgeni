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
  });

  describe("processor()", function() {
    it("should add the processor to the processors property", function() {
      var package = new Package('packageName');
      package.processor(function testProcessor() {});
      expect(package.processors[0]).toEqual('testProcessor');
    });

    it("should complain if the factory is not a function", function() {
      var package = new Package('packageName');
      expect(function() {
        package.processor({ some: 'non-function'});
      }).toThrow();
    });

    it("should complain if the factory does not have a name", function() {
      var package = new Package('packageName');
      expect(function() {
        package.processor(function() {});
      }).toThrow();
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
        package.factory({ some: 'non-function'});
      }).toThrow();
    });

    it("should complain if the factory does not have a name", function() {
      var package = new Package('packageName');
      expect(function() {
        package.factory(function() {});
      }).toThrow();
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
        package.type({ some: 'non-function'});
      }).toThrow();
    });

    it("should complain if the constructor does not have a name", function() {
      var package = new Package('packageName');
      expect(function() {
        package.type(function() {});
      }).toThrow();
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