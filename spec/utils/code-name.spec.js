var codeName = require('../../lib/utils/code-name');

xdescribe("code-name", function() {
  describe("absoluteName", function() {
    it("returns an absolute name given a doc and name in the same module and type", function() {
      expect(codeName.absoluteName({ module: 'ng', ngdoc: 'directive', name: 'ngShow'}, 'ngClass'))
        .toEqual('module:ng.directive:ngClass');

      expect(codeName.absoluteName({ module: 'ng', ngdoc: 'directive', name: 'ngShow'}, 'directive:ngClass'))
        .toEqual('module:ng.directive:ngClass');

      expect(codeName.absoluteName({ module: 'ng', ngdoc: 'directive', name: 'ngShow'}, 'module:ng.directive:ngClass'))
        .toEqual('module:ng.directive:ngClass');
    });

    it("returns an absolute name given a doc and name in the same module but different type", function() {
      expect(codeName.absoluteName({ module: 'ng', ngdoc: 'filter', name: 'currency'}, 'directive:ngClass'))
        .toEqual('module:ng.directive:ngClass');

      expect(codeName.absoluteName({ module: 'ng', ngdoc: 'filter', name: 'currency'}, 'module:ng.directive:ngClass'))
        .toEqual('module:ng.directive:ngClass');
    });

    it("returns an absolute name given a doc and name in a different module", function() {
      expect(codeName.absoluteName({ module: 'ng', ngdoc: 'filter', name: 'currency'}, 'module:ngRoute.directive:ngView'))
        .toEqual('module:ngRoute.directive:ngView');
    });
  });

  describe("relativeName", function() {
    it("returns an relative name given a doc and an absolute name", function() {
      expect(codeName.relativeName({ module: 'ng', ngdoc: 'directive', name: 'ngShow'}, 'module:ng.directive:ngClass'))
        .toEqual('ngClass');

      expect(codeName.relativeName({ module: 'ng', ngdoc: 'directive', name: 'ngShow'}, 'module:ng.filter:currency'))
        .toEqual('filter:currency');
    });
  });

  describe("toPath", function() {
    it("returns a path to the item given by the code name", function() {
      codeName.apiSection = 'api';
      expect(codeName.toPath('module:ng.directive:ngClass').toEqual('api/ng/directive/ngClass'));
    });
  });

  describe("fromPath", function() {
    it("returns a codeName for a given path", function() {
      codeName.apiSection = 'api';
      expect(codeName.fromPath('api/ng/directive/ngClass').toEqual('module:ng.directive:ngClass'));
    });
  });
});