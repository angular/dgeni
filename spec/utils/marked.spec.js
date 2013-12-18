var marked = require('../../lib/utils/marked');

describe("marked utility", function() {
  it("should configure the marked library", function() {
    expect(marked.defaults.highlight).toEqual(jasmine.any(Function));
    expect(marked.defaults.langPrefix).toEqual('prettyprint linenum lang-');
  });
});