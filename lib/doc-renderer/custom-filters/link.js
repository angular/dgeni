var getLinkInfo = require('../../utils/link-info');

module.exports = {
  name: 'link',
  process: function(url, doc, title) {
    return getLinkInfo(doc, url, title).anchorElement;
  }
};