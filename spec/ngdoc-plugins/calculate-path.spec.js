var calculatePath = require('../../lib/ngdoc-plugins/calculate-path');
var path = require('path');

describe("calculate-path", function() {
  it("should calculate the path for ngdoc files from the file name", function() {
    var doc = { fileType: 'ngdoc', file: path.normalize('a/b/c.ngdoc') };
    calculatePath.after(doc);
    expect(doc.path).toEqual('a/b/c');
  });

  it("should calculate the path for js files from the doc meta data", function() {
    var doc = { fileType: 'js', section: 'api', ngdoc: 'directive', module: 'ng', name: 'input.checkbox' };
    calculatePath.after(doc);
    expect(doc.path).toEqual('api/ng/directive/input.checkbox');

    doc = { fileType: 'js', section: 'api',ngdoc: 'function', module: 'ng', name: '$compile' };
    calculatePath.after(doc);
    expect(doc.path).toEqual('api/ng/$compile');

    doc = { fileType: 'js', section: 'api',ngdoc: 'filter', module: 'ng', name: 'currency' };
    calculatePath.after(doc);
    expect(doc.path).toEqual('api/ng/filter/currency');

  });
});