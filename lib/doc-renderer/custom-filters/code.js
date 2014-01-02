var hljs = require('highlight.js');
module.exports = {
  name: 'code',
  process: function(str) {
    var output = '<code class="prettyprint linenum">'+hljs.highlightAuto(str).value+'</code>';
    return output;
  }
};