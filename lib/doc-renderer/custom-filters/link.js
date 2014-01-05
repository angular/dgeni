var codeName = require('../../utils/code-name');

module.exports = {
  name: 'link',
  process: function(url, doc, title) {
    return codeName.getLinkInfo(doc, url, title).anchorElement;
  }
};