var hljs = require('highlight.js');
module.exports = function(str) {
  return '<code class="prettyprint linenum">'+hljs.highlightAuto(str).value+'</code>';
};