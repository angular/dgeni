module.exports = function(tag, doc) {
  doc[tag.name] = tag.text;
  return true;
};