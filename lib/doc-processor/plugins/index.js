module.exports = [
  require('./extract-tags')(require('./tag-defs')),
  require('./compute-path'),
  require('./merge-child-docs'),
  require('./process-links')
];