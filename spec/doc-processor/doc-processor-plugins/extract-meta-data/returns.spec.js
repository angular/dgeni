var plugin = require('../../../../lib/doc-processor/doc-processor-plugins/extract-meta-data/returns');

describe("returns tag", function() {

  it("should add a returns property to the doc", function() {
    var doc = {
      tags : [ {
        title: 'returns',
        type: { name: 'string', type: 'NameExpression' },
        description: 'description of returns'
      } ]
    };
    plugin.each(doc);
    expect(doc.returns).toEqual({
      type: 'string',
      description: 'description of returns'
    });
  });

  it("should throw an exception if both return and returns tags are specified", function() {
    var doc = {
      tags: [
        { title: 'returns' },
        { title: 'return' }
      ]
    };
    expect(function() { plugin.each(doc); }).toThrow();
  });

});

describe("return tag", function() {

  it("should add a returns property to the doc", function() {
    var doc = {
      tags : [ {
        title: 'return',
        type: { name: 'string', type: 'NameExpression' },
        description: 'description of returns'
      } ]
    };
    plugin.each(doc);
    expect(doc.returns).toEqual({
      type: 'string',
      description: 'description of returns'
    });
  });

});