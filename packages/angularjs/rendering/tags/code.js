var hljs = require('highlight.js');
var trimIndentation = require('../../../lib/utils/trim-indentation');

module.exports = {
  tags: ['code'],

  parse: function(parser, nodes) {
    parser.advanceAfterBlockEnd();

    var content = parser.parseUntilBlocks("endcode");
    var tag = new nodes.CallExtension(this, 'process', null, [content]);
    parser.advanceAfterBlockEnd();

    return tag;
  },

  process: function(context, content) {
    var trimmedString = trimIndentation(content());
    var codeString = '<pre><code class="prettyprint linenum">'+hljs.highlightAuto(trimmedString).value+'</code></pre>';
    return codeString;
  }
};