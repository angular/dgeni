var plugin = require('../../../../lib/doc-processor/doc-processor-plugins/extract-meta-data/property');

describe("property tag", function() {

  it("should add a property object to the properties property on the doc", function() {
    var doc = {
      tags: [
        {
          title: 'property',
          name: 'propertyName',
          description: 'description of property',
          type: { type: 'NameExpression', name: 'string' }
        }
      ]
    };
    plugin.each(doc);
    expect(doc.properties).toEqual([{
      type: 'string',
      name: 'propertyName',
      description: 'description of property'
    }]);
  });

});
