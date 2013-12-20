var marked = require('../../utils/marked');
var codeName = require('../../utils/code-name');

module.exports = {
  name: 'codeLink',
  process: function(url, doc, title) {
    var linkInfo = codeName.getLinkInfo(doc, url, title);
    if ( linkInfo.type === 'code' ) {
      title = marked('`'+linkInfo.title+'`');
    }
    return '<a href="'+linkInfo.url+'">'+title+'</a>';
  }
};