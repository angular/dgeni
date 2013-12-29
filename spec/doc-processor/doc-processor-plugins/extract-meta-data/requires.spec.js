var plugin = require('../../../../lib/doc-processor/doc-processor-plugins/extract-meta-data/requires');
describe("requires doc processor plugin", function() {
  it("should extract an array of requires information from the tags", function() {
    var doc = {
      module: 'ng',
      componentType: '',
      tags: [
        { title: 'requires', description: '$compile' },
        { title: 'requires', description: 'directive:ngClick' },
        { title: 'requires', description: 'module:ngRoute.directive:ngView' }
      ]
    };

    plugin.each(doc);
    expect(doc.requires).toEqual([
      'module:ng.$compile',
      'module:ng.directive:ngClick',
      'module:ngRoute.directive:ngView'
    ]);
  });
});