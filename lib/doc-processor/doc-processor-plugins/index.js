module.exports = [].concat(
  require('./extract-meta-data'),
  require('./merge-child-docs'),
  require('./check-links')
);