var parser = require('../../lib/__legacy__template-helpers/install-module');

describe("template-helpers/install-module", function() {
  it("should replace the {@installModule moduleName} directive with content", function() {
    var html = parser('{@installModule animate}');
    expect(html).toContain('<h1>Installation</h1>');
    expect(html).toContain('include <code>angular-animate.js</code>');
    expect(html).toContain('<code>bower install angular-animate@X.Y.Z</code>');
    expect(html).toContain('<code>"//code.angularjs.org/X.Y.Z/angular-animate.js"</code>');
    expect(html).toContain("angular.module('app', ['ngAnimate']);");
  });
});
