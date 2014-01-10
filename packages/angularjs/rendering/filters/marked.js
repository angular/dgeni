var marked = require('../../../../lib/utils/marked');
module.exports = {
  name: 'marked',
  process: function(str) {
    var output = str && marked(str);
    return output;
  }
};