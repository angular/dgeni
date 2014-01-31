var code = require('../../../../lib/utils/code');
module.exports = {
  name: 'code',
  process: function(str) {
    return code(str, true);
  }
};