var codeName = require('../../lib/utils/code-name');

describe("code-name", function() {
  xdescribe("absoluteName", function() {
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

  xdescribe("relativeName", function() {
    it("returns an relative name given a doc and an absolute name", function() {
      expect(codeName.relativeName({ module: 'ng', ngdoc: 'directive', name: 'ngShow'}, 'module:ng.directive:ngClass'))
        .toEqual('ngClass');

      expect(codeName.relativeName({ module: 'ng', ngdoc: 'directive', name: 'ngShow'}, 'module:ng.filter:currency'))
        .toEqual('filter:currency');
    });
  });

  describe("getLinkInfo", function() {
    describe('for real urls', function() {
      it("should replace urls containing slashes with HTML anchors to the same url", function() {
        var someDoc = { };

        expect(codeName.getLinkInfo(someDoc, '/some/absolute/url', 'some link')).toEqual({ url: "/some/absolute/url", title: "some link", type: 'url'});
        expect(codeName.getLinkInfo(someDoc, 'some/relative/url', 'some other link')).toEqual({ url: "some/relative/url", title: "some other link", type: 'url'});
        expect(codeName.getLinkInfo(someDoc, '../some/other/relative/url', 'some link')).toEqual({ url: "../some/other/relative/url", title: "some link", type: 'url'});
        expect(codeName.getLinkInfo(someDoc, 'http://www.google.com', 'Google')).toEqual({ url: "http://www.google.com", title: "Google", type: 'url'});
      });
    });

    describe("for code references", function() {
      var someDoc;

      beforeEach(function() {
        someDoc = { module: 'ng', name:'ngClass', ngdoc:'directive', section: 'api' };
      });


      it("should replace relative references to code in the current module with HTML anchors to the correct url", function() {
        expect(codeName.getLinkInfo(someDoc, 'ngShow')).toEqual({ url: "/api/ng/directive/ngShow", title: "ngShow", type: "code"});
        expect(codeName.getLinkInfo(someDoc, 'directive:ngShow')).toEqual({ url: "/api/ng/directive/ngShow", title: "ngShow", type: "code"});

        expect(codeName.getLinkInfo(someDoc, 'input[checkbox]')).toEqual({ url: "/api/ng/directive/input[checkbox]", title: "input[checkbox]", type: "code"});
        expect(codeName.getLinkInfo(someDoc, 'filter:currency')).toEqual({ url: "/api/ng/filter/currency", title: "currency", type: "code"});
        expect(codeName.getLinkInfo(someDoc, 'module:ng.$compile')).toEqual({ url: "/api/ng/$compile", title: "$compile", type: "code"});
      });
      

      it("should replace references to modules with HTML anchors to the correct url", function() {
        expect(codeName.getLinkInfo(someDoc, 'module:ng')).toEqual({ url: "/api/ng", title: "ng", type: "code"});
        expect(codeName.getLinkInfo(someDoc, 'module:ngRoute')).toEqual({ url: "/api/ngRoute", title: "ngRoute", type: "code"});
        expect(codeName.getLinkInfo(someDoc, 'module:ngSanitize')).toEqual({ url: "/api/ngSanitize", title: "ngSanitize", type: "code"});
      });
      

      it("should replace references to code in other modules with HTML anchors to the correct url", function() {
        expect(codeName.getLinkInfo(someDoc, 'module:ngRoute.directive:ngView')).toEqual({ url: "/api/ngRoute/directive/ngView", title: "ngView", type: "code"});
      });
      

      it("should replace references to code in the global namespace with HTML anchors to the correct url", function() {
        expect(codeName.getLinkInfo(someDoc, 'global:angular.element')).toEqual({ url: "/api/ng/global/angular.element", title: "angular.element", type: "code"});
        expect(codeName.getLinkInfo(someDoc, 'module:ngMock.global:angular.mock.dump')).toEqual({ url: "/api/ngMock/global/angular.mock.dump", title: "angular.mock.dump", type: "code"});
      });


      it("should replace code references to members of objects with HTML anchors to the correct url", function() {
        expect(codeName.getLinkInfo(someDoc, 'module:ng.$location#methods_search', 'search()')).toEqual({ url: "/api/ng/$location#methods_search", title: "search()", type: "code"});
      });
    });

  });

  xdescribe("fromPath", function() {
    it("returns a codeName for a given path", function() {
      codeName.apiSection = 'api';
      expect(codeName.fromPath('api/ng/directive/ngClass').toEqual('module:ng.directive:ngClass'));
    });
  });
});