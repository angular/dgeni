var tags = require('../../lib/utils/tags');
describe("get-tag", function() {
  it("should get the specified tag from the tags collection", function() {
    var doc = { tags: [ {title: 'a', description: 'description of a'}, { title: 'b', description: 'description of b'}] };
    expect(tags.getTag(doc.tags, 'a')).toEqual({title: 'a', description: 'description of a'});
    expect(tags.getTag(doc.tags, 'b')).toEqual({title: 'b', description: 'description of b'});
    expect(tags.getTag(doc.tags, 'c')).toEqual(null);
  });
});