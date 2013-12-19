var marked = require('../../utils/marked');
module.exports = {
  name: 'code',
  process: function(str) {
    var output = marked('`'+str+'`');
    return output;
  }
};