var rewire = require('rewire');
var filter = rewire('../../../rendering/filters/code');

describe("code custom filter", function() {
  var markedMock;

  it("should have the name 'code'", function() {
    expect(filter.name).toEqual('code');
  });
  it("should transform the content using the provided marked function into highlighted code", function() {
    expect(filter.process('function foo() { }')).toEqual(
      '<code class="prettyprint linenum">'+
        '<span class="function">' +
          '<span class="keyword">function</span> '+
          '<span class="title">foo</span>' +
          '<span class="params">()</span> {' +
        '</span> }' +
      '</code>');
  });
});