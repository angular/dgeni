var marked = require('../../utils/marked');
module.exports = {
  name: 'marked',
  process: function(str) {
    var output = str && marked(str);
    return output;
  }
};