/**
 * don't touch the tag - can be used as a default for unknown inline tags
 */
module.exports = function(doc, tagName, otherStuff) {
  return '{@'+tagName+' '+otherStuff+'}';
};