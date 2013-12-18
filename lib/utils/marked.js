var marked = require('marked');
var hljs = require('highlight.js');

marked.setOptions({
  highlight: function (code, lang) {
    var output = hljs.highlightAuto(code).value;
    return output;
  },
  langPrefix: 'prettyprint linenum lang-' // The lang prefix allows us to sneak CSS classes in
});

module.exports = marked;