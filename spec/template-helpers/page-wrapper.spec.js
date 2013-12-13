var parser = require('../../lib/template-helpers/page-wrapper');

describe("template-helpers/page-wrapper", function() {
  it("should wrap the given text in a div with a calculated CSS class", function() {
    expect(parser('some body text', {name: 'ng/docName'}))
      .toEqual('<div class="ng-page ng-docname-page">some body text</div>');
  });
});