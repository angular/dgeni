var plugin = require('../../../../lib/doc-processor/doc-processor-plugins/extract-meta-data/param');
var doctrine = require('doctrine');

describe("param tag", function() {
  it("should add param tags to a params array on the doc", function() {
    var doc = doctrine.parse(
      '@param {string} paramName description of param\n' +
      '@param {string=} optionalParam description of optional param\n' +
      '@param {string} [paramWithDefault=xyz] description of param with default',
      { sloppy: true } // to allow square brackets in param name
    );

    plugin.each(doc);

    expect(doc.params[0]).toEqual(
    {
      name: 'paramName',
      description: 'description of param',
      type: 'string',
      optional: false
    });
    expect(doc.params[1]).toEqual(
    {
      name: 'optionalParam',
      description: 'description of optional param',
      type: 'string=',
      optional: true
    });
    expect(doc.params[2]).toEqual(
    {
      name: 'paramWithDefault',
      description: 'description of param with default',
      type: 'string=',
      optional: true,
      default: 'xyz'
    });
  });
});