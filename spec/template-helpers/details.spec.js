var parser = require('../../lib/template-helpers/details');

describe("template-helpers/details", function() {
  it("should extract //!details directives and replace with HTML", function() {
    expect(parser('//!details="REGEX" path/to/local/docs/file.html\n' +
                  'some text containing REGEX inside\n'))
      .toEqual(
        'some text containing ' +
        '<div class="nocode nocode-content" data-foldout data-url="/notes/path/to/local/docs/file.html">' +
          'REGEX' +
        '</div>' + ' inside\n');
  });
});