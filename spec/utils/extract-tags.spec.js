var extractTagsFactory = require('../../lib/utils/extract-tags');

describe("extract-tags", function() {

  it("should accept a non-undefined, falsy value from a defaultFn", function() {
    var extractTags = extractTagsFactory([
      { name: 'priority', defaultFn: function(doc) { return 0; } }
    ]);
    var doc = {
      tags: {
        getTags: function() { return []; }
      }
    };
    extractTags(doc);
    expect(doc.priority).toBe(0);
  });
  
});