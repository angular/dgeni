var _ = require('lodash');
var logger = require('winston');
var rewire = require('rewire');
var plugin = rewire('../../processors/links');

describe("links doc-processor plugin", function() {
  var doc, links, logLevel;

  beforeEach(function() {
    logLevel = logger.level;
    logger.level = 'warn';
    spyOn(logger, 'warn');
    plugin.before();
    doc = {
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
    plugin.each(doc);
    plugin.after([doc]);
    links = plugin.__get__('links');
  });

  afterEach(function() {
    logger.level = logLevel;
  });

  it("should convert url links to anchors", function() {
    expect(doc.description).toEqual('Some text with a <a href="some/url">link</a> to somewhere');
  });

  it("should convert code links to anchors with formatted code", function() {
    expect(doc.example).toEqual('Some example with a code link: <a href="api/ngOther/directive/ngDirective"><code>ngDirective</code></a>');
    expect(doc.goodLink).toEqual('A link to reachable code: <a href="api/ng/directive/ngInclude"><code>ngInclude</code></a>');
  });

  it("should collect the link in the links array", function() {
    expect(links).toEqual({
      'some/url': {
        doc: doc,
        url : 'some/url',
        title : 'link',
        type : 'url',
        anchorElement : '<a href="some/url">link</a>'
      },
      'api/ngOther/directive/ngDirective': {
        doc: doc,
        url: 'api/ngOther/directive/ngDirective',
        title: '<code>ngDirective</code>',
        type: 'code',
        anchorElement: '<a href="api/ngOther/directive/ngDirective"><code>ngDirective</code></a>'
      },
      'api/ng/directive/ngInclude': {
        doc: doc,
        url: 'api/ng/directive/ngInclude',
        title: '<code>ngInclude</code>',
        type: 'code',
        anchorElement: '<a href="api/ng/directive/ngInclude"><code>ngInclude</code></a>'
      }
    });
  });

  it("should check that any links in the links property of a doc reference a valid doc", function() {
    expect(logger.warn).toHaveBeenCalled();
    expect(logger.warn.calls[0].args).toEqual([
      'In doc "some/file.js" at line 200: Invalid link, "api/ngOther/directive/ngDirective"'
    ]);
    expect(logger.warn.calls[1].args).toEqual([
      'In doc "some/file.js" at line 200: Invalid link, "api/ng/directive/ngInclude"'
    ]);
  });
});