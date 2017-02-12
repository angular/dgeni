const {expect, spy} = require('chai').use(require('chai-spies'));

import {Package} from './Package';
import {Processor, ProcessorDef} from './Processor';

describe('Package', function() {
  describe('constructor()', function() {

    it('should complain if no name is given', function() {
      expect(() => new Package(null)).to.throw();
      expect(function() {
        new Package(['dep1', 'dep2'] as any);
      }).to.throw();
    });

    it('should add dependencies, if provided', function() {
      const pkg = new Package('packageName', ['dep1', 'dep2']);
      expect(pkg.dependencies).to.eql(['dep1', 'dep2']);
    });

    it('should create an empty dependencies collection if no dependencies are provided', function() {
      const pkg = new Package('packageName');
      expect(pkg.dependencies).to.eql([]);
    });

    it('should complain if dependencies is not an array', function() {
      expect(function() {
        new Package('somePackage', {} as any);
      }).to.throw();
    });
  });

  describe('isPackage', function() {
    it('should return true for instances of Package', function() {
      const realPackage = new Package('realPackage', ['dep1']);
      expect(Package.isPackage(realPackage)).to.equal(true);
    });
    it('should return true for pkg-like objects', function() {
      const duckPackage = {
        name: 'duckPackage',
        module: {},
        dependencies: ['dep1']
      };
      expect(Package.isPackage(duckPackage)).to.equal(true);
    });
    it('should return false for non-pkg-like objects', function() {
      const nonPackage = {
        name: 'nonPackage',
        // module: {},
        dependencies: ['dep1']
      };
      expect(Package.isPackage(nonPackage)).to.equal(false);
    });
    it('should return false if passed a non-object', function() {
      const nonPackage = 'packageName';
      expect(Package.isPackage(nonPackage)).to.equal(false);
    });
  });

  describe('processor()', function() {

    it('should add processors defined by an object to the processors property', function() {
      const pkg = new Package('packageName');
      pkg.processor({ name: 'testProcessor'} as Processor);
      expect(pkg.processors[0]).to.equal('testProcessor');
    });

    it('should add processors defined by a factory function to the processors property', function() {
      const pkg = new Package('packageName');
      pkg.processor(function testProcessor() {} as ProcessorDef);
      expect(pkg.processors[0]).to.equal('testProcessor');
    });

    it('should complain if the processorFactory does not have a name', function() {
      const pkg = new Package('packageName');
      expect(function() {
        pkg.processor(function() {} as ProcessorDef);
      }).to.throw();

      expect(function() {
        pkg.processor({ missing: 'name'} as any);
      }).to.throw();
    });

    it('should use the first param as the name if it is a string', function() {
      const pkg = new Package('packageName');
      pkg.processor('testProcessor', { $process: function() { } } as any);
      expect(pkg.processors[0]).to.equal('testProcessor');
    });

    it('should add the processor to the DI module', function() {
      const pkg = new Package('packageName');
      const testProcessor = function testProcessor() {};
      pkg.processor(testProcessor as ProcessorDef);
      expect(pkg.module['testProcessor']).to.eql(['factory', testProcessor]);
    });
  });

  describe('factory()', function() {
    it('should complain if the factory is not a function', function() {
      const pkg = new Package('packageName');
      expect(() => pkg.factory({ name: 'bad factory'} as any)).to.throw();
    });

    it('should complain if the factory does not have a name', function() {
      const pkg = new Package('packageName');
      expect(() => pkg.factory(function() {})).to.throw();
    });

    it('should use the first param as the name if it is a string', function() {
      const pkg = new Package('packageName');

      const testServiceFactory = function() {};
      pkg.factory('testService', testServiceFactory);
      expect(pkg.module['testService']).to.eql(['factory', testServiceFactory]);
    });

    it('should add the service to the DI module', function() {
      const pkg = new Package('packageName');
      const testService = function testService() {};
      pkg.factory(testService);
      expect(pkg.module['testService']).to.eql(['factory', testService]);
    });
  });


  describe('type()', function() {
    it('should complain if the constructor is not a function', function() {
      const pkg = new Package('packageName');
      expect(() => pkg.type({ name: 'bad type'} as any)).to.throw();
    });

    it('should complain if the constructor does not have a name', function() {
      const pkg = new Package('packageName');
      expect(() => pkg.type(function() {} as any)).to.throw();
    });

    it('should use the first param as the name if it is a string', function() {
      const pkg = new Package('packageName');
      const TestService = function() {};
      pkg.type('testService', TestService);
      expect(pkg.module['testService']).to.eql(['type', TestService]);
    });

    it('should add the service to the DI module', function() {
      const pkg = new Package('packageName');
      const TestService = function TestService() {};
      pkg.type(TestService);
      expect(pkg.module['TestService']).to.eql(['type', TestService]);
    });
  });


  describe('config()', function() {
    it('should add the function to the configFns property', function() {
      const pkg = new Package('packageName');
      const testFn = function() {};
      pkg.config(testFn);
      expect(pkg.configFns[0]).to.equal(testFn);
    });

    it('should complain if configFn is not a function', function() {
      const pkg = new Package('packageName');
      expect(function() {
        pkg.config({ some: 'non-function'} as any);
      }).to.throw();
    });
  });

  describe('eventHandlers()', function() {

    it('should add eventHandler name defined by a factory function to the handlers property', function() {
      const pkg = new Package('packageName');
      pkg.eventHandler('testEvent', function testHandler() {});
      expect(pkg.handlers['testEvent']).to.eql(['testHandler']);
    });

    it('should compute a unique name for the handler if it doesn\'t have one', function() {
      const pkg = new Package('packageName');
      pkg.eventHandler('testEvent', function() {});
      expect(pkg.handlers['testEvent'][0]).to.equal('packageName_testEvent_0');
      pkg.eventHandler('testEvent', function() {});
      expect(pkg.handlers['testEvent'][1]).to.equal('packageName_testEvent_1');
    });

    it('should complain if the eventType is not a string', function() {
      const pkg = new Package('packageName');
      expect(() => pkg.eventHandler(function() {} as any, null)).to.throw();
    });

    it('should complain if the handler is not a function', function() {
      const pkg = new Package('packageName');
      expect(() => pkg.eventHandler('testEvent', {name: 'bad handler'} as any)).to.throw();
    });

    it('should add the eventHandler to the DI module', function() {
      const pkg = new Package('packageName');
      const testHandler = function testHandler() {};
      pkg.eventHandler('testEvent', testHandler);
      expect(pkg.module['testHandler']).to.eql(['factory', testHandler]);


      pkg.eventHandler('testEvent', function() {});
      const factoryDef = pkg.module['packageName_testEvent_1'];
      expect(factoryDef[0]).to.eql('factory');
      expect(factoryDef[1]).to.be.a('function');
    });
  });
});
