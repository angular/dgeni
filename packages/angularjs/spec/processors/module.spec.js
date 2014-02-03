var _ = require('lodash');
var processor = require('../../processors/module');

describe("module doc processor", function() {

  var modules;
  var moduleDoc1, moduleDoc2;
  var componentDoc1, componentDoc2, componentDoc3;
  var docs;

  beforeEach(function() {
    moduleDoc1 = { docType: 'module', id: 'module:ng', name: 'ng' };
    moduleDoc2 = { docType: 'module', id: 'module:ngRoute', name: 'ngRoute' };
    componentDoc1 = { docType: 'directive', id: 'module:ng.directive:ngClick', name: 'ngClick', module: 'ng' };
    componentDoc2 = { docType: 'service', id: 'module:ngRoute.$route', name: '$route', module: 'ngRoute' };
    componentDoc3 = { docType: 'function', id: 'module:ng.global:angular.element', name: 'angular.element', module: 'ng' };

    var docs = [
      componentDoc2,
      moduleDoc1,
      componentDoc1,
      componentDoc3,
      moduleDoc2
    ];

    modules = {};

    processor.process(docs, modules);

  });

  it("should be named 'module'", function() {
    expect(processor.name).toEqual('module');
  });

  it("should compute the package info for the module", function() {
    expect(moduleDoc1.packageName).toEqual('angular');
    expect(moduleDoc1.packageFile).toEqual('angular.js');

    expect(moduleDoc2.packageName).toEqual('angular-route');
    expect(moduleDoc2.packageFile).toEqual('angular-route.js');
  });

  it("should add a list of components to module docs", function() {
    expect(moduleDoc1.components).toEqual([
      componentDoc1, componentDoc3
    ]);

    expect(moduleDoc2.components).toEqual([componentDoc2]);
  });

  it("should add a moduleDoc property to each component", function() {
    expect(componentDoc1.moduleDoc).toBe(moduleDoc1);
    expect(componentDoc2.moduleDoc).toBe(moduleDoc2);
    expect(componentDoc3.moduleDoc).toBe(moduleDoc1);
  });
});