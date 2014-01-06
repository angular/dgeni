var getLinkInfo = require('../../lib/utils/link-info');

describe("getLinkInfo", function() {
  describe('for real urls', function() {
    it("should replace urls containing slashes with HTML anchors to the same url", function() {
      var someDoc = { };

      expect(getLinkInfo(someDoc, '/some/absolute/url')).toEqual({ doc: someDoc, url: "/some/absolute/url", title: "url", type: 'url', anchorElement : '<a href="/some/absolute/url">url</a>'});
      expect(getLinkInfo(someDoc, 'some/relative/url')).toEqual({ doc: someDoc, url: "some/relative/url", title: "url", type: 'url', anchorElement : '<a href="some/relative/url">url</a>'});
      expect(getLinkInfo(someDoc, '../some/other/relative/url')).toEqual({ doc: someDoc, url: "../some/other/relative/url", title: "url", type: 'url', anchorElement : '<a href="../some/other/relative/url">url</a>'});
      expect(getLinkInfo(someDoc, 'http://www.google.com')).toEqual({ doc: someDoc, url: "http://www.google.com", title: "www.google.com", type: 'url', anchorElement : '<a href="http://www.google.com">www.google.com</a>'});

      expect(getLinkInfo(someDoc, '/some/absolute/url', 'some link')).toEqual({ doc: someDoc, url: "/some/absolute/url", title: "some link", type: 'url', anchorElement : '<a href="/some/absolute/url">some link</a>'});
      expect(getLinkInfo(someDoc, 'some/relative/url', 'some other link')).toEqual({ doc: someDoc, url: "some/relative/url", title: "some other link", type: 'url', anchorElement : '<a href="some/relative/url">some other link</a>'});
      expect(getLinkInfo(someDoc, '../some/other/relative/url', 'some link')).toEqual({ doc: someDoc, url: "../some/other/relative/url", title: "some link", type: 'url', anchorElement : '<a href="../some/other/relative/url">some link</a>'});
      expect(getLinkInfo(someDoc, 'http://www.google.com', 'Google')).toEqual({ doc: someDoc, url: "http://www.google.com", title: "Google", type: 'url', anchorElement : '<a href="http://www.google.com">Google</a>'});
    });
  });

  describe("for code references", function() {
    var someDoc;

    beforeEach(function() {
      someDoc = { module: 'ng', name:'ngClass', componentType:'directive', section: 'api' };
    });


    it("should replace relative references to code in the current module with HTML anchors to the correct url", function() {
      expect(getLinkInfo(someDoc, 'ngShow').anchorElement).toEqual('<a href="/api/ng/directive/ngShow"><code class="prettyprint linenum"><span class="title">ngShow</span></code></a>');
      expect(getLinkInfo(someDoc, 'directive:ngShow').anchorElement).toEqual('<a href="/api/ng/directive/ngShow"><code class="prettyprint linenum"><span class="title">ngShow</span></code></a>');

      expect(getLinkInfo(someDoc, 'input[checkbox]').anchorElement).toEqual('<a href="/api/ng/directive/input[checkbox]"><code class="prettyprint linenum"><span class="tag">input</span><span class="attr_selector">[checkbox]</span></code></a>');
      expect(getLinkInfo(someDoc, 'filter:currency').anchorElement).toEqual('<a href="/api/ng/filter/currency"><code class="prettyprint linenum"><span class="title">currency</span></code></a>');
      expect(getLinkInfo(someDoc, 'module:ng.$compile').anchorElement).toEqual('<a href="/api/ng/$compile"><code class="prettyprint linenum"><span class="variable">$compile</span></code></a>');
    });
    

    it("should replace references to modules with HTML anchors to the correct url", function() {
      expect(getLinkInfo(someDoc, 'module:ng').anchorElement).toEqual('<a href="/api/ng/index.html"><code class="prettyprint linenum"><span class="title">ng</span></code></a>');
      expect(getLinkInfo(someDoc, 'module:ngRoute').anchorElement).toEqual('<a href="/api/ngRoute/index.html"><code class="prettyprint linenum"><span class="title">ngRoute</span></code></a>');
      expect(getLinkInfo(someDoc, 'module:ngSanitize').anchorElement).toEqual('<a href="/api/ngSanitize/index.html"><code class="prettyprint linenum"><span class="title">ngSanitize</span></code></a>');
    });
    

    it("should replace references to code in other modules with HTML anchors to the correct url", function() {
      expect(getLinkInfo(someDoc, 'module:ngRoute.directive:ngView').anchorElement).toEqual('<a href="/api/ngRoute/directive/ngView"><code class="prettyprint linenum"><span class="title">ngView</span></code></a>');
    });
    

    it("should replace references to code in the global namespace with HTML anchors to the correct url", function() {
      expect(getLinkInfo(someDoc, 'global:angular.element').anchorElement).toEqual('<a href="/api/ng/global/angular.element"><code class="prettyprint linenum"><span class="title">angular</span>.element</code></a>');
      expect(getLinkInfo(someDoc, 'module:ngMock.global:angular.mock.dump').anchorElement).toEqual('<a href="/api/ngMock/global/angular.mock.dump"><code class="prettyprint linenum">angular<span class="preprocessor">.mock</span><span class="preprocessor">.dump</span></code></a>');
    });


    it("should replace code references to members of objects with HTML anchors to the correct url", function() {
      expect(getLinkInfo(someDoc, 'module:ng.$location#methods_search', 'search()').anchorElement).toEqual('<a href="/api/ng/$location#methods_search">search()</a>');
    });
  });

});
