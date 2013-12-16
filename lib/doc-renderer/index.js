var nunjucks = require('nunjucks');
var writer = require('../utils/doc-writer');
var path = require('path');
var marked = require('marked');
var hljs = require('highlight.js');

module.exports = function docRendererFactory(templateFolder, outputFolder) {

  var env = nunjucks.configure(templateFolder, {
    tags: {
      variableStart: '{$',
      variableEnd: '$}'
    }
  });

  marked.setOptions({
    gfm: true,
    tables: true,
    highlight: function (code, lang) {
      var output = hljs.highlightAuto(code).value;
      return output;
    },
    langPrefix: 'prettyprint linenum lang-' // The lang prefix allows us to sneak CSS classes in
  });

  env.addFilter('marked', function(str) {
      var output = marked(str);
      return output;
  });

  /**
   * Render the specified document with the given template
   * @param  {string} template Path (within the template folder) to the doc template
   * @param  {object} doc      The document to render
   */
  return function render(data) {
    var res = nunjucks.render(data.doc.ngdoc + '.template.html', data);
    var outputPath = path.join(outputFolder, data.doc.path);
    writer.writeFile(outputPath, res);
    return outputPath;
  };

};