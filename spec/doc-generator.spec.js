var docGenerator = require('../lib/doc-generator');
var configurer = require('../lib/config');
var Config = configurer.Config;

function createConfig() {
  return new Config({
    processing: {
      processors: []
    }
  });
}

describe("doc-generator", function() {


  it("should return a generator function", function() {
    var generator = docGenerator(createConfig());
    expect(generator).toEqual(jasmine.any(Function));

    var docs = [];
    docs = generator(docs);
  });

  it("should try to load a config file if passed a string", function() {
    spyOn(configurer, 'load').andReturn(createConfig());
    docGenerator('someFileName');
    expect(configurer.load).toHaveBeenCalled();
  });

  it("should raise an error if config is not a Config", function() {
    expect(function() { docGenerator({}); }).toThrow();
  });

});