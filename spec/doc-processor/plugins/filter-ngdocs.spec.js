var plugin = require('../../../lib/doc-processor/plugins/filter-ngdocs');

describe("filter-ngdocs doc-processor plugin", function() {
  it("should only return docs that have the ngdoc tag", function() {
    var docs = [
      { tags: [{ title: 'ngdoc', description: 'a' }] },
      { tags: [{ title: 'other', description: 'b' }] },
      { tags: [{ title: 'ngdoc', description: 'c' }, { title: 'other', description: 'd' }] },
      { tags: [] }
    ];

    var filteredDocs = plugin.before(docs);

    expect(filteredDocs).toEqual([
      { tags: [{ title: 'ngdoc', description: 'a' }] },
      { tags: [{ title: 'ngdoc', description: 'c' }, { title: 'other', description: 'd' }] }
    ]);
  });
});