var marked = require('marked');

module.exports = function(text, doc) {
  return marked(text);
};