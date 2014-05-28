var rewire = require('rewire');
var configurer = rewire('../lib/config');
var Config = configurer.Config;
var log = require('winston');
var path = require('canonical-path');

describe("Config", function() {
  var config;

  beforeEach(function() {
    var level = log.level;
    log.level = 'error';
    config = new Config();
    log.level = level;
  });

  it("should be an instance of Config", function() {
    expect(config instanceof Config);
  });

  it("should have functions for changing properties", function() {
    config.set('logging.level', 'debug');
    expect(config.logging.level).toEqual('debug');

    config.append('source.extractors', 'a');
    expect(config.source.extractors).toEqual(['a']);

    config.append('source.extractors', ['x', 'y']);
    expect(config.source.extractors).toEqual(['a', 'x', 'y']);

    config.append('other.newArray', 'a');
    expect(config.other.newArray).toEqual(['a']);

    config.prepend('rendering.templateFolders', ['x', 'y']);
    expect(config.rendering.templateFolders).toEqual(['x', 'y']);

    config.prepend('rendering.templateFolders', ['a', 'b']);
    expect(config.rendering.templateFolders).toEqual(['a', 'b', 'x', 'y']);

    config.prepend('other.newArray2', 'x');
    expect(config.other.newArray2).toEqual(['x']);

    config.set('some.extra.property', 'value');
    expect(config.some.extra.property).toEqual('value');

    config.merge('some.extra', { foo: 'bar' });
    expect(config.some.extra).toEqual({
      property: 'value',
      foo: 'bar'
    });

  });

  it("should have a function for getting a value", function() {
    config.set('logging.level', 'debug');
    expect(config.get('logging.level', 'other')).toEqual('debug');
    expect(config.get('logging.missing', 'other')).toEqual('other');
    expect(config.get('completely.random.missing.property', 'missingVal')).toEqual('missingVal');
  });

  describe("load", function() {
    var defaultConfig, oldRequire, requireSpy, logLevel;

    beforeEach(function() {
      logLevel = log.level;
      log.level = 'warn';

      defaultConfig = new Config({ array: [ 'a', 'b' ] });
      mockConfigFile = function(config) {
        config.set('a', 'x');
        config.get('array')[1] = 'y';
        return config;
      };

      requireSpy = jasmine.createSpy('require').andReturn(mockConfigFile);
      oldRequire = configurer.__get__('require');
      configurer.__set__('require', requireSpy);
    });

    afterEach(function() {
      configurer.__set__('require', oldRequire);
      log.level = logLevel;
    });

    it("should call require to load the config", function() {
      Config.load('configFile.js', defaultConfig);
      expect(requireSpy).toHaveBeenCalledWith(path.resolve('configFile.js'));
    });

    it("should fail if the base config is not a Config instance", function() {
      expect(function() { Config.load('configFile.js', {}); }).toThrow();
    });

    it("should fail if no configFile is specified", function() {
      expect(function() {
        Config.load();
      }).toThrow('No config file specified.');
    });

    it("should fail with a nice message if loading the config file fails", function() {
      requireSpy.andCallFake(function() { throw new Error('Random Error'); });
      expect(function() {
        Config.load('configFile.js', defaultConfig);
      }).toThrow();
    });


    it("should fail with a nice message if the config file function does not return an instance of Config", function() {
      requireSpy.andReturn(function() { return function() { return { some: 'object' }; }; });
      expect(function() {
        Config.load('configFile.js', defaultConfig);
      }).toThrow();
    });

    it("should override the defaultConfig", function() {
      var newConfig = Config.load('configFile.js', defaultConfig);
      expect(newConfig).toEqual(new Config({
        a: 'x',
        array: [ 'a', 'y'],
        basePath : path.resolve('.')
      }));
    });
  });

});

