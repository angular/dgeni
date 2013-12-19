var marked = require('../../utils/marked');
var trimIndentation = require('../../utils/trim-indentation');

module.exports = {
  tags: ['marked'],

  parse: function(parser, nodes) {
    parser.advanceAfterBlockEnd();

    var content = parser.parseUntilBlocks("endmarked");
    var tag = new nodes.CallExtension(this, 'process', null, [content]);
    parser.advanceAfterBlockEnd();

    return tag;
  },

  process: function(context, content) {
    var contentString = content();
    var indent = trimIndentation.calcIndent(contentString);
    var trimmedString = trimIndentation.trimIndent(contentString, indent);
    var markedString = marked(trimmedString);
    var reindentedString = trimIndentation.reindent(markedString, indent);
    return reindentedString;
  }
};