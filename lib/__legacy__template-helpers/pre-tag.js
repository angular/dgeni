/**
 * add pretty print classes to pre tags
 */
module.exports = function(text, doc, placeholders) {
  return text.replace(/^<pre(.*?)>([\s\S]*?)<\/pre>/gmi, function(_, attrs, content){
    return placeholders.add(doc,
      '<pre'+attrs+' class="prettyprint linenums">' +
        content.replace(/</g, '&lt;').replace(/>/g, '&gt;') +
        '</pre>');
  });
};