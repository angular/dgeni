var code = require('../../utils/code');
module.exports = {
  name: 'code',
  process: function(str) {
    return code(str);
  }
};