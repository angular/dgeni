var plugin = require('../../../lib/ngdoc-parser/ngdoc-plugins/calculate-module');
var path = require('path');

describe("calculate-module ngdoc plugin", function() {
  it("should not do anything if the fileType is not 'js'", function() {
    var doc = { file: 'b', fileType: 'ngdoc' };
    plugin.after(doc);
    expect(doc.module).toBeUndefined();
  });
  it("should not change the module if it exists already", function() {
    var doc = { module: 'a', file: 'b', fileType:'js'};
    plugin.after(doc);
    expect(doc.module).toEqual('a');
  });
  it("should calculate the module from the second segment of the file if it's a js", function() {
    var doc = { file: path.normalize('a/b/c/d.js'), fileType:'js'};
    plugin.after(doc);
    expect(doc.module).toEqual('b');
  });
});