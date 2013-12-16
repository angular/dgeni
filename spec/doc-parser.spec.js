var docParserFactory = require('../lib/doc-parser');

describe("doc-parser", function() {

  it("should call each of the plugins in turn, passing the docs object to each", function() {
    var log = [], docs = ['a', 'b'];
    plugin1 = function(docs) { log.push('plugin1'); return docs;};
    plugin2 = function(docs) { log.push('plugin2'); return docs;};

    var parseDocs = docParserFactory([plugin1, plugin2]);
    var parsedDocs = parseDocs(docs);
    expect(log).toEqual(['plugin1', 'plugin2']);
    expect(parsedDocs).toEqual(docs);
  });
});