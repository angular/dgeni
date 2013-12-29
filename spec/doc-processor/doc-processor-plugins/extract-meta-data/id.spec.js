var plugin = require('../../../../lib/doc-processor/doc-processor-plugins/extract-meta-data/id');
describe("id doc processor plugin", function() {
  it("should take the tag from the doc if it's there", function() {
    var doc = { componentType: 'directive', name: 'ngView', module: 'ngRoute', fileType: 'js' };
    doc.tags = [ { title: 'id', description: 'abc.xyz' }];
    plugin.each(doc);
    expect(doc.id).toEqual('abc.xyz');    
  });
  

  it("should compute the id from the doc's meta data if it's a js file", function() {
    var doc = { componentType: 'directive', name: 'ngView', module: 'ngRoute', fileType: 'js', parentId: '' };
    plugin.each(doc);
    expect(doc.id).toEqual('module:ngRoute.directive:ngView');

    doc = {
      docType: 'event',
      module: 'ng',
      componentType: '',
      name: '$includeContentRequested',
      fileType: 'js',
      parentId: 'module:ng.directive:ngInclude'
    };
    plugin.each(doc);
    expect(doc.id).toEqual('module:ng.directive:ngInclude#$includeContentRequested');
  });


  it("should compute the id from the name if it's there and it's not a js file", function() {
    var doc = { fileType: 'ngdoc', file: 'foobar.ngdoc', name: 'abc.xyz' };
    plugin.each(doc);
    expect(doc.id).toEqual('abc.xyz');

    doc = { fileType: 'ngdoc', file: 'foobar.ngdoc' };
    plugin.each(doc);
    expect(doc.id).toEqual('foobar');
  });
});