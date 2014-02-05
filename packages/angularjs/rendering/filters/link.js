var _ = require('lodash');
var log = require('winston');

module.exports = {
  name: 'link',
  process: function(url, partialNames, title, doc) {
    return _.template('{@ link ${url} ${title} }', { url: url, title: title });
  }
};