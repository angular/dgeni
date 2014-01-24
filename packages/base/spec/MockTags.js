var MockTags = function(tags) {
  this.tags = tags;
};
MockTags.prototype = {
  getTag: function(name, aliases) {
    return this.tags[name];
  },
  getTags: function(name, aliases) {
    return this.tags[name];
  },
  getType: function(tag) {
    return tag.type;
  }
};

module.exports = MockTags;