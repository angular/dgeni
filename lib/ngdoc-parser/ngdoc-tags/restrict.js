var _ = require('lodash');

function contains(text, ch) {
  return text.indexOf(ch) !== -1;
}

/**
 * Extract the "restrict" info from the tag
 * @param  {[type]} tag [description]
 * @param  {[type]} doc [description]
 * @return {[type]}     [description]
 */
module.exports = function(tagInfo) {
  if (tagInfo.name === 'restrict') {
    tagInfo.doc.restrict = {
      element: contains(tagInfo.text, 'E'),
      attribute: contains(tagInfo.text, 'A'),
      cssClass: contains(tagInfo.text, 'C'),
      comment: contains(tagInfo.text, 'M')
    };
    return true;
  }
};