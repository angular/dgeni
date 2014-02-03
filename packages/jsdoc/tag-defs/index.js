var checkProperty = require('../../../lib/utils/check-property');
var path = require('canonical-path');
var _ = require('lodash');

module.exports = [
  {
    name: 'name',
    required: true
  },
  

  {
    name: 'memberof',
    defaultFn: function(doc) {
      if ( doc.docType === 'event' || doc.docType === 'property' || doc.docType === 'method' ) {
        throw new Error('Missing tag "@memberof" for doc of type "'+ doc.docType + '" in file "' + doc.file + '" at line ' + doc.startingLine);
      }
    },
    transformFn: function(doc, tag) {
      if ( !(doc.docType === 'event' || doc.docType === 'property' || doc.docType === 'method') ) {
        throw new Error('"@'+ tag.name +'" tag found on non-'+ doc.docTyep +' document in file "' + doc.file + '" at line ' + doc.startingLine);
      }
    }
  },


  {
    name: 'param',
    multi: true,
    docProperty: 'params',
    transformFn: function(doc, tag) {
      // doctrine doesn't support param name aliases
      var match = /^(?:\|(\S+)\s)?([\s\S]*)/.exec(tag.description);
      var alias = match[1];
      var description = match[2];
      var param = {
        name: tag.name,
        description: description,
        type: doc.tags.getType(tag),
      };
      if (tag.default) {
        param.default = tag.default;
      }
      if (alias) {
        param.alias = alias;
      }
      return param;
    }
  },


  {
    name: 'property',
    multi: true,
    docProperty: 'properties',
    transformFn: function(doc, tag) {
      return {
        type: doc.tags.getType(tag),
        name: tag.name,
        description: tag.description
      };
    }
  },


  {
    name: 'returns',
    aliases: ['return'],
    transformFn: function(doc, tag) {
      return {
        type: doc.tags.getType(tag),
        description: tag.description
      };
    }
  },


  { name: 'module' },
  { name: 'description' },
  { name: 'usage' },
  { name: 'animations' },
  { name: 'constructor' },
  { name: 'class' },
  { name: 'classdesc' },
  { name: 'global' },
  { name: 'namespace' },
  { name: 'kind' }
];
