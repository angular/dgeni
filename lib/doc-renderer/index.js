var nunjucks = require('nunjucks');
var writer = require('../utils/doc-writer');
var path = require('path');

module.exports = function docRendererFactory(templateFolder, outputFolder) {

  nunjucks.configure(templateFolder, {
    tags: {
      variableStart: '{$',
      variableEnd: '$}'
    }
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