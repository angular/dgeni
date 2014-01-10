var rewire = require('rewire');
var config = rewire('../../lib/utils/config');
var log = require('winston');

describe("config utility", function() {
  var defaultConfig, fs, logLevel;

  beforeEach(function() {
    logLevel = log.level;
    log.level = 'warn';
    defaultConfig = { array: [ 'a', 'b' ] };

    fs = config.__get__('fs');
    spyOn(fs, 'readFileSync').andReturn('a = "x";\narray[1] = "y";');
  });

  afterEach(function() {
    log.level = logLevel;
  });


  it("should clone the default", function() {
    var newConfig = config('configFile.js', defaultConfig);
    expect(newConfig).not.toBe(defaultConfig);
  });


  it("should call readFileSync", function() {
    config('configFile.js', defaultConfig);
    expect(fs.readFileSync).toHaveBeenCalledWith('configFile.js');
  });

  it("should override the defaultConfig", function() {
    var newConfig = config('configFile.js', defaultConfig);
    expect(newConfig).toEqual({
      a: 'x',
      array: [ 'a', 'y']
    });
  });
});