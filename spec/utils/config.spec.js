var rewire = require('rewire');
var configurer = rewire('../../lib/utils/config');
var log = require('winston');
var path = require('canonical-path');

describe("default-config", function() {
  var config;

  beforeEach(function() {
    var level = log.level;
    log.level = 'error';
    config = configurer.load();
    log.level = level;
  });

  it("should have some default values", function() {
    expect(config.source).toEqual({
      files : [],
      extractors: []
    });

    expect(config.processing).toEqual({
      processors: [],
      tagDefinitions: []
    });

    expect(config.rendering).toEqual({
      templateFolders: [],
      templatePatterns: [],
      filters: [],
      tags: []
    });

    expect(config.logging).toEqual({
      level: 'info'
    });
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
});

describe("config utility", function() {
  var defaultConfig, oldRequire, requireSpy, logLevel;

  beforeEach(function() {
    logLevel = log.level;
    log.level = 'warn';

    defaultConfig = { array: [ 'a', 'b' ] };
    mockConfigFile = function(config) {
      config.a = 'x';
      config.array[1] = 'y';
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
    configurer.load('configFile.js', defaultConfig);
    expect(requireSpy).toHaveBeenCalledWith(path.resolve('configFile.js'));
  });


  it("should override the defaultConfig", function() {
    var newConfig = configurer.load('configFile.js', defaultConfig);
    expect(newConfig).toEqual({
      a: 'x',
      array: [ 'a', 'y'],
      basePath : path.resolve('.')
    });
  });
});