var docGenerator = require('../lib/doc-generator');
var Config = require('../lib/config').Config;

describe("doc-generator", function() {
  it("should return a generator function", function() {
    var config = new Config({
      processing: {
        processors: []
      }
    });
    var generator = docGenerator(config);
  });
});