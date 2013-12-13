var idFromName = require('../../lib/ngdoc-plugins/calculate-id');

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
  it("should calculate the id from the filename if no id or name exist", function() {
    var doc = { file: 'a/b.js', fileType: 'js'};
    idFromName.after(doc);
    expect(doc.id).toEqual('b');
  });
});