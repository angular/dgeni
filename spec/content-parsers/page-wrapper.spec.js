var parser = require('../../lib/content-parsers/page-wrapper');

describe("content-parsers/page-wrapper", function() {
  it("should wrap the given text in a div with a calculated CSS class", function() {
    expect(parser('some body text', {name: 'ng/docName'}))
      .toEqual('<div class="ng-page ng-docname-page">some body text</div>');
  });
});