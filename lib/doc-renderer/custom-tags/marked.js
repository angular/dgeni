var marked = require('../../utils/marked');

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
    return marked(content());
  }
};