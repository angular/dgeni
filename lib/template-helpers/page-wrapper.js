// Should be done in templates

var className = require('./class-name');

function getPageClassName(doc) {
  var split, before, after, suffix = '-page';

  parts = doc.name && doc.name.split('/');
  if(parts && parts.length > 1) {
    after = className.prepareClassName(parts.pop());
    before = className.prepareClassName(parts.pop());
    return before + suffix + ' ' + before + '-' + after + suffix;
  }
  return className.prepareClassName(doc.name || 'docs') + suffix;
}


/**
 * Wrap the content of the document in a div with a doc-specific CSS class
 */
module.exports = function(text, doc) {
  return '<div class="' + getPageClassName(doc) + '">' + text + '</div>';
};