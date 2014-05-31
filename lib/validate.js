var _ = require('lodash');

module.exports = {
  required: function(value) {
    if ( !value ) {
      throw new Error('value is required');
    }
  }
};