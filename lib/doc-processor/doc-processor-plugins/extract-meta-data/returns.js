var doctrine = require('doctrine');
var tags = require('../../../utils/tags');

module.exports = {
  name: 'returns',
  each: function(doc) {
    var returnsTag = tags.getTag(doc.tags, 'returns');
    var returnTag = tags.getTag(doc.tags, 'return');
    if ( returnsTag && returnTag ) {
      throw new Error('You cannot have both a "return" and a "returns" tag in the same document');
    }
    returnsTag = returnsTag || returnTag;
    if ( returnsTag ) {
      doc.returns = {
        type: doctrine.type.stringify(returnsTag.type),
        description: returnsTag.description
      };
    }
  }
};