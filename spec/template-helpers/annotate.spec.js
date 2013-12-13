var parser = require('../../lib/template-helpers/annotate');

describe("template-helpers/annotate", function() {
  it("should extract //!annotate directives and replace with HTML", function() {
    expect(parser('//!annotate="some" a title|annotation thing\nsome content\n'))
      .toEqual(
        '\n' +
        '<div class="nocode nocode-content" '+
          'data-popover ' +
          'data-content="annotation thing" ' +
          'data-title="a title">' +
          'some' +
        '</div> ' +
        'content\n');
  });
});