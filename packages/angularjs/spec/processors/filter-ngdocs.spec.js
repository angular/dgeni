var plugin = require('../../processors/filter-ngdocs');

var tagParser = require('../../../default/processors/doctrine-tag-parser');

describe("filter-ngdocs doc-processor plugin", function() {
  it("should only return docs that have the ngdoc tag", function() {
    var docs = [
      { tags: [{ title: 'ngdoc', description: 'a' }] },
      { tags: [{ title: 'other', description: 'b' }] },
      { tags: [{ title: 'ngdoc', description: 'c' }, { title: 'other', description: 'd' }] },
      { tags: [] }
    ];

    var filteredDocs = plugin.before(docs, tagParser);

    expect(filteredDocs).toEqual([
      { tags: [{ title: 'ngdoc', description: 'a' }] },
      { tags: [{ title: 'ngdoc', description: 'c' }, { title: 'other', description: 'd' }] }
    ]);
  });
});