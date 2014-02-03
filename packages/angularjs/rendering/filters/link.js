var _ = require('lodash');
var log = require('winston');

module.exports = {
  name: 'link',
  process: function(url, partialNames, title, doc) {
    if ( !url ) {
      console.log('invalid url: ', doc);
    }
    var linkInfo = partialNames.getLink(url, title);
    if ( !linkInfo.valid ) {
      log.warn('Error rendering link filter\n' + linkInfo.error);
    }
    return _.template('<a href="${url}">${title}</a>', linkInfo);
  }
};