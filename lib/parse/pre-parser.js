var placeholderMap = require('../utils/placeholder-map');

module.exports = function(text, doc) {
  return text.replace(/^<pre(.*?)>([\s\S]*?)<\/pre>/mi, function(_, attrs, content){
    return placeholderMap.add(doc,
      '<pre'+attrs+' class="prettyprint linenums">' +
        content.replace(/</g, '&lt;').replace(/>/g, '&gt;') +
        '</pre>');
  });
};