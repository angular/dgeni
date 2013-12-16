var idFromName = require('../../../lib/ngdoc-parser/ngdoc-plugins/calculate-id');

describe("calculate-id ngdoc plugin", function() {
  it("should not change the id if it exists already", function() {
    var doc = { id: 'a', name: 'b'};
    idFromName.after(doc);
    expect(doc.id).toEqual('a');
  });
  it("should calculate the id from the name if no id exists", function() {
    var doc = { name: 'b'};
    idFromName.after(doc);
    expect(doc.id).toEqual('b');
  });
  it("should calculate the id from the doc meta data if doc is from a JS file and no id exists", function() {
    var doc = { fileType: 'js', module: 'a', ngdoc: 'filter', name: 'b'};
    idFromName.after(doc);
    expect(doc.id).toEqual('module:a.filter:b');

    doc = { fileType: 'js', module: 'a', ngdoc: 'directive', name: 'b'};
    idFromName.after(doc);
    expect(doc.id).toEqual('module:a.directive:b');

    doc = { fileType: 'js', module: 'a', ngdoc: 'global', name: 'b'};
    idFromName.after(doc);
    expect(doc.id).toEqual('module:a.global:b');

    doc = { fileType: 'js', module: 'a', ngdoc: 'type', name: 'B'};
    idFromName.after(doc);
    expect(doc.id).toEqual('module:a.B');

  });
  it("should calculate the id as a module if only the name is given", function() {
    var doc = { fileType: 'js', ngdoc: 'overview', name: 'b'};
    idFromName.after(doc);
    expect(doc.id).toEqual('module:b');
  });
});