var codeName = require('../../lib/utils/code-name');

describe("code-name", function() {

  describe("getPartialNames", function() {
    it("should return an array of partial names for a full code name", function() {
      expect(codeName.getPartialNames('module:ng.service:$http')).toEqual([
        '$http',
        'service:$http',
        'ng.$http',
        'module:ng.$http',
        'ng.service:$http',
        'module:ng.service:$http'
      ]);
      expect(codeName.getPartialNames('module:ng.service:$http#get')).toEqual([
        '$http#get',
        'service:$http#get',
        'ng.$http#get',
        'module:ng.$http#get',
        'ng.service:$http#get',
        'module:ng.service:$http#get',
        'get'
      ]);
    });
  });

  describe("getAbsoluteCodeName", function() {
    it("returns an absolute name given a doc and name in the same module and componentType", function() {
      expect(codeName.getAbsoluteCodeName({ module: 'ng', componentType: 'directive', name: 'ngShow'}, 'ngClass'))
        .toEqual('module:ng.directive:ngClass');

      expect(codeName.getAbsoluteCodeName({ module: 'ng', componentType: 'directive', name: 'ngShow'}, 'directive:ngClass'))
        .toEqual('module:ng.directive:ngClass');

      expect(codeName.getAbsoluteCodeName({ module: 'ng', componentType: 'directive', name: 'ngShow'}, 'module:ng.directive:ngClass'))
        .toEqual('module:ng.directive:ngClass');
    });

    it("returns an absolute name given a doc and name in the same module but different componentType", function() {
      expect(codeName.getAbsoluteCodeName({ module: 'ng', componentType: 'filter', name: 'currency'}, 'directive:ngClass'))
        .toEqual('module:ng.directive:ngClass');

      expect(codeName.getAbsoluteCodeName({ module: 'ng', componentType: 'filter', name: 'currency'}, 'module:ng.directive:ngClass'))
        .toEqual('module:ng.directive:ngClass');
    });

    it("returns an absolute name given a doc and name in a different module", function() {
      expect(codeName.getAbsoluteCodeName({ module: 'ng', componentType: 'filter', name: 'currency'}, 'module:ngRoute.directive:ngView'))
        .toEqual('module:ngRoute.directive:ngView');
      expect(codeName.getAbsoluteCodeName({ module: 'ng', componentType: 'filter', name: 'currency'}, 'module:ngRoute.$route'))
        .toEqual('module:ngRoute.$route');
    });

    it("returns an absolute name given a non-code doc", function() {
      expect(codeName.getAbsoluteCodeName({ docType: 'overview', name: 'Developer Guide: Scopes'}, 'module:ngRoute.directive:ngView'))
        .toEqual('module:ngRoute.directive:ngView');
    });
  });

  xdescribe("relativeName", function() {
    it("returns an relative name given a doc and an absolute name", function() {
      expect(codeName.relativeName({ module: 'ng', componentType: 'directive', name: 'ngShow'}, 'module:ng.directive:ngClass'))
        .toEqual('ngClass');

      expect(codeName.relativeName({ module: 'ng', componentType: 'directive', name: 'ngShow'}, 'module:ng.filter:currency'))
        .toEqual('filter:currency');
    });
  });


  xdescribe("fromPath", function() {
    it("returns a codeName for a given path", function() {
      codeName.apiSection = 'api';
      expect(codeName.fromPath('api/ng/directive/ngClass').toEqual('module:ng.directive:ngClass'));
    });
  });
});