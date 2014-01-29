var log = require('winston');
var extractTagsFactory = require('../../../lib/utils/extract-tags');

var extractTags;
var plugin = module.exports = {
  name: 'doctrine-tag-extractor',
  runAfter: ['doctrine-tag-parser'],
  description:
    'Extract the information from the tags that were parsed',
  init: function initialize(config) {
    if ( !config || !config.processing || !config.processing.tagDefinitions ) {
      throw new Error('Invalid config.\n'+
      'You must provide an array of tag definitions, at config.processing.tagDefinitions');
    }
    extractTags = extractTagsFactory(config.processing.tagDefinitions);
  },
  each: function(doc) {
    log.debug('extracting tags from  ' + doc.file);
    extractTags(doc);
  }
};



