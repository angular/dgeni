var rewire = require('rewire');
var config = rewire('../../lib/utils/config');
var log = require('winston');
var path = require('canonical-path');

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
    oldRequire = config.__get__('require');
    config.__set__('require', requireSpy);
  });

  afterEach(function() {
    config.__set__('require', oldRequire);
    log.level = logLevel;
  });

  it("should call require to load the config", function() {
    config('configFile.js', defaultConfig);
    expect(requireSpy).toHaveBeenCalledWith('configFile.js');
  });


  it("should clone the default", function() {
    var newConfig = config('configFile.js', defaultConfig);
    expect(newConfig).not.toBe(defaultConfig);
  });


  it("should override the defaultConfig", function() {
    var newConfig = config('configFile.js', defaultConfig);
    expect(newConfig).toEqual({
      a: 'x',
      array: [ 'a', 'y'],
      basePath : path.resolve('.')
    });
  });
});