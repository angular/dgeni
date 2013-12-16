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
module.exports = function(tag, doc) {
  if (tag.name === 'restrict') {
    doc.restrict = {
      element: contains(tag.text, 'E'),
      attribute: contains(tag.text, 'A'),
      cssClass: contains(tag.text, 'C'),
      comment: contains(tag.text, 'M')
    };
    return true;
  }
};