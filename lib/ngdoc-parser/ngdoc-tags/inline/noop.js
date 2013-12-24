/**
 * don't touch the tag - can be used as a default for unknown inline tags
 */
module.exports = function(containingTag, inlineTagName, inlineTagContent) {
  return '{@'+inlineTagName+' '+inlineTagContent+'}';
};