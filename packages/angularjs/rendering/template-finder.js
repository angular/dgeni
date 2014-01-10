var fs = require('fs');
var _ = require('lodash');

module.exports = function templateFinderFactory(templateFolder, extension) {
  var templateFolderPaths = fs.readdirSync(templateFolder);
  var templateMap = _.indexBy(templateFolderPaths);
        
  return function templateFinder(doc) {
    return templateMap[doc.id + '.' + extension] || templateMap[doc.docType + '.' + extension];
  };
};