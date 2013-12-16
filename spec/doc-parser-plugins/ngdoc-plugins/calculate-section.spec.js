var plugin = require('../../../lib/doc-parser-plugins/ngdoc-plugins/calculate-section');
var path = require('path');

describe("calculate-section ngdoc plugin", function() {
  it("should not change the section if it exists already", function() {
    var doc = { section: 'a', file: 'b', fileType:'ngdoc'};
    plugin.after(doc);
    expect(doc.section).toEqual('a');
  });
  it("should calculate the section from the file if it's an ngdoc", function() {
    var doc = { file: path.normalize('a/b/c/d.ngdoc'), fileType:'ngdoc'};
    plugin.after(doc);
    expect(doc.section).toEqual('a');
  });
  it("should use 'api' for the section if it's a js doc", function() {
    var doc = { file: path.normalize('a/b.js'), fileType: 'js'};
    plugin.after(doc);
    expect(doc.section).toEqual('api');
  });
});