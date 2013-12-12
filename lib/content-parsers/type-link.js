var className = require('../utils/class-name');
module.exports = function(text) {
  return text.replace(/{@type\s+(\S+)(?:\s+(\S+))?}/g, function(_, type, url) {
    url = url || '#';
    return '<a href="' + url + '" class="' + className.prepareTypeHintClassName(type) + '">' + type + '</a>';
  });
};
