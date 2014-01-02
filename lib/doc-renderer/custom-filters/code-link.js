var codeFilter = require('./code.js');
var codeName = require('../../utils/code-name');

function trimWhitespace(str) {
  return str.replace(/(^\s+|\s+$)/g, '');
}

module.exports = {
  name: 'codeLink',
  process: function(url, doc, title) {
    var linkInfo = codeName.getLinkInfo(doc, url, title);
    if ( !title && linkInfo.type === 'code' ) {
      linkInfo.title = trimWhitespace(codeFilter.process(linkInfo.title));
    }
    return '<a href="'+linkInfo.url+'">'+linkInfo.title+'</a>';
  }
};