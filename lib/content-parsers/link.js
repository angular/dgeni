var path = require('path');
var convertUrlToAbsolute = require('../utils/convert-url-to-absolute');

var IS_URL = /^(https?:\/\/|ftps?:\/\/|mailto:|\.|\/)/,
    IS_ANGULAR = /^(api\/)?(angular|ng|AUTO)\./,
    IS_HASH = /^#/;

/**
 * convert {@link} directives to real HTML anchors
 */
module.exports = function(text, doc) {
  return text.replace(/{@link\s+([^\s}]+)\s*([^}]*?)\s*}/g, function(_all, url, title){
    var isFullUrl = url.match(IS_URL),
      isAngular = url.match(IS_ANGULAR),
      isHash = url.match(IS_HASH),
      absUrl = (isHash || isFullUrl) ? url : [path.dirname(doc.file), url].join('/');

      console.log(url, doc.file, path.dirname(doc.file));

    if (!isFullUrl) {
      doc.links = doc.links || [];
      doc.links.push(absUrl);
    }

    return '<a href="' + absUrl + '">' +
      (isAngular ? '<code>' : '') +
      (title || url).replace(/^#/g, '').replace(/\n/g, ' ') +
      (isAngular ? '</code>' : '') +
      '</a>';
  });
};