var nunjucks = require('nunjucks');
var writer = require('./utils/doc-writer');
var path = require('path');

module.exports = function partialGeneratorFactory(templateFolder, outputFolder) {

  nunjucks.configure(templateFolder, {
    tags: {
      variableStart: '{$',
      variableEnd: '$}'
    }
  });

  return function renderTemplate(template, doc) {
    var res = nunjucks.render(template, doc);
    writer.writeFile(path.join(outputFolder,doc.path + '.html'), res);
  };

};