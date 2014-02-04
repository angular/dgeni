var _ = require('lodash');
var logger = require('winston');
var rewire = require('rewire');
var plugin = rewire('../../processors/links');
var PartialNames = require('../../../../lib/utils/partial-names').PartialNames;

describe("links doc-processor plugin", function() {
  var doc, links, logLevel, partialNames;

  beforeEach(function() {
    logLevel = logger.level;
    logger.level = 'warn';
    spyOn(logger, 'warn');

    partialNames = new PartialNames();
    partialNames.addDoc({ id: 'module:ng.directive:ngInclude', path: 'api/ng/directive/ngInclude', name: 'ngInclude' });

    doc = {
      id: 'test.doc',
      componentType: 'directive',
      module: 'ng',
      name: 'ngInclude',
      description: "Some text with a {@link some/url link} to somewhere",
      example: "Some example with a code link: {@link module:ngOther.directive:ngDirective}",
      goodLink: "A link to reachable code: {@link ngInclude}",
      area: 'api',
      file: 'some/file.js',
      startingLine: 200
    };
    plugin.process([doc], partialNames);
  });

  afterEach(function() {
    logger.level = logLevel;
  });

  it("should convert url links to anchors", function() {
    expect(doc.description).toEqual('Some text with a <a href="some/url">link</a> to somewhere');
  });

  it("should convert code links to anchors with formatted code", function() {
    expect(doc.example).toEqual('Some example with a code link: <a href="module:ngOther.directive:ngDirective">module:ngOther.directive:ngDirective</a>');
    expect(doc.goodLink).toEqual('A link to reachable code: <a href="api/ng/directive/ngInclude"><code>ngInclude</code></a>');
  });

  it("should check that any links in the links property of a doc reference a valid doc", function() {
    expect(logger.warn).toHaveBeenCalled();
    expect(logger.warn.calls[0].args).toEqual([
      'Error processing links for "test.doc" in file "some/file.js" at line 200:\n' +
      'Invalid link (does not match any doc): "module:ngOther.directive:ngDirective"'
    ]);
  });
});