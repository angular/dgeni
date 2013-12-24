module.exports = function(tagInfo) {
  tagInfo.doc[tagInfo.name] = tagInfo.text;
  return true;
};