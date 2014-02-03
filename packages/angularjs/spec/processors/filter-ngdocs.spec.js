var plugin = require('../../processors/filter-ngdocs');
var MockTags = require('../MockTags');

describe("filter-ngdocs doc-processor plugin", function() {
  it("should only return docs that have the ngdoc tag", function() {
    var docs = [
      { tags: new MockTags({ ngdoc: 'a' }) },
      { tags: new MockTags({ other: 'b' }) },
      { tags: new MockTags({ ngdoc: 'c' , other: 'd' }) },
      { tags: new MockTags([]) }
    ];

    var filteredDocs = plugin.process(docs);

    expect(filteredDocs).toEqual([
      { tags: new MockTags({ ngdoc: 'a' }) },
      { tags: new MockTags({ ngdoc: 'c' , other: 'd' }) }
    ]);
  });
});