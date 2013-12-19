var calculatePath = require('../../../lib/ngdoc-parser/ngdoc-plugins/calculate-path');

describe("calculate-path", function() {
  it("should calculate the path for ngdoc files from the file name", function() {
    var doc = { fileType: 'ngdoc', file: 'guide/services/manage-dependencies.ngdoc' };
    calculatePath.after(doc);
    expect(doc.path).toEqual('guide/services/manage-dependencies.html');

    doc = { fileType: 'ngdoc', file: 'error/$compile/ctreq.ngdoc'};
    calculatePath.after(doc);
    expect(doc.path).toEqual('error/$compile/ctreq.html');
  });

  it("should calculate the path for js files from the doc meta data", function() {
    var doc = { fileType: 'js', section: 'api', ngdoc: 'directive', module: 'ng', name: 'input.checkbox' };
    calculatePath.after(doc);
    expect(doc.path).toEqual('api/ng/directive/input.checkbox.html');

    doc = { fileType: 'js', section: 'api', ngdoc: 'service', module: 'ng', name: '$compile' };
    calculatePath.after(doc);
    expect(doc.path).toEqual('api/ng/$compile.html');

    doc = { fileType: 'js', section: 'api', ngdoc: 'filter', module: 'ng', name: 'currency' };
    calculatePath.after(doc);
    expect(doc.path).toEqual('api/ng/filter/currency.html');

    doc = { fileType: 'js', section: 'api', ngdoc: 'function', name: 'angular.forEach', module:'ng' };
    calculatePath.after(doc);
    expect(doc.path).toEqual('api/ng/global/angular.forEach.html');

    doc = { fileType: 'js', section: 'api', ngdoc: 'module', name: 'ngSanitize', module: 'ngSanitize' };
    calculatePath.after(doc);
    expect(doc.path).toEqual('api/ngSanitize/index.html');
  });
});