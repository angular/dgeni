var filter = require('../../../lib/doc-renderer/custom-filters/link');

describe("link filter", function() {

  it("should have the name 'link'", function() {
    expect(filter.name).toEqual('link');
  });

  beforeEach(function() {
    function escapeForRegex(str) {
      return str.replace('$', '\\$');
    }

    this.addMatchers({
      toMatchCodeLink: function(url, text) {
        var regex = new RegExp('<a href="'+ escapeForRegex(url) + '"><code.*>.*'+ escapeForRegex(text) + '.*<\/code><\/a>');
        this.message = function() {
          return "Expected code link '" + this.actual + "'to match " + regex.toString();
        };
        return regex.test(this.actual);
      }
    });
  });

  it("should return an HTML anchor for a code reference", function() {
    var doc = { componentType: 'directive', section: 'api', module: 'ng', docType: 'directive', name: 'ngShow'};
    expect(filter.process('ngClass', doc)).toMatchCodeLink('/api/ng/directive/ngClass', 'ngClass');
    expect(filter.process('module:ngRoute.$route', doc)).toMatchCodeLink("/api/ngRoute/$route","$route");

    expect(filter.process('ngClass', doc, 'some title')).toEqual('<a href="/api/ng/directive/ngClass">some title</a>');
    expect(filter.process('module:ngRoute.$route', doc, 'some title')).toEqual('<a href="/api/ngRoute/$route">some title</a>');
  });

  it("should return an HTML anchor for a url", function() {
    var doc = { section: 'api', module: 'ng', docType: 'directive', componentType: 'directive', name: 'ngShow'};
    expect(filter.process('/guide/directives', doc)).toEqual('<a href="/guide/directives">directives</a>');
    expect(filter.process('/tutorial/step-1', doc, 'Step 1')).toEqual('<a href="/tutorial/step-1">Step 1</a>');
  });
});