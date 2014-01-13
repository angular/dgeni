var extractTagsFactory = require('../../../lib/utils/extract-tags');

var plugin = module.exports = {
  name: 'doctrine-tag-extractor',
  description:
    'Extract the information from the tags that were parsed',
  init: function initialize(config) {
    if ( !config || !config.processing || !config.processing.tagDefinitions ) {
      throw new Error('Invalid config.\n'+
      'You must provide an array of tag definitions, at config.processing.tagDefinitions');
    }
    plugin.extractTags = extractTagsFactory(config.processing.tagDefinitions);
  },
  each: function extractTags(doc) {
    plugin.extractTags(doc);
  }
};



