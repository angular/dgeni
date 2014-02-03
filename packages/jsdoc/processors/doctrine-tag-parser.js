var _ = require('lodash');
var doctrine = require('doctrine');

// A simple container of parsed tags with helpers
var Tags = function(content) {
  var parsed = doctrine.parse(content);
  this.tags = parsed.tags;

  // Extract the description if necessary
  if ( parsed.description ) {
    var descriptionTag = this.getTag('description');
    if ( descriptionTag ) {
      descriptionTag.description = parsed.description + '\n' + descriptionTag.description;
    } else {
      this.tags.push({
        title: 'description',
        description: parsed.description
      });
    }
  }
};

Tags.prototype = {
  getTag: function(name, aliases) {
    var names = (aliases || []).concat(name);
    return _.find(this.tags, function(tag) { return _.contains(names, tag.title); });
  },

  getTags: function(name, aliases) {
    var names = (aliases || []).concat(name);
    return _.where(this.tags, function(tag) { return _.contains(names, tag.title); });
  },

  getType: function(tag) {
    var isOptional = tag.type.type === 'OptionalType';
    var mainType = isOptional ? tag.type.expression : tag.type;
    var mainTypeString = doctrine.type.stringify(mainType);
    var isUnion = mainType.type === 'UnionType';
    var typeList;
    if ( isUnion ) {
      typeList = _.map(mainType.elements, function(element) {
        return doctrine.type.stringify(element);
      });
    } else {
      typeList = [mainTypeString];
    }

    return {
      description: mainTypeString,
      optional: isOptional,
      typeList: typeList
    };
  }
};


var plugin = module.exports = {
  name: 'doctrine-tag-parser',
  description: 'Parse the doc for tags using doctrine.',
  runAfter: ['parsing-tags'],
  runBefore: ['tags-parsed'],
  before: function parseDocsWithDoctrine(docs) {
    _.forEach(docs, function(doc) {
      doc.tags = new Tags(doc.content);
    });
  }
};