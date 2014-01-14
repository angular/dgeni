var codeName = require('../../../lib/utils/code-name');
var checkProperty = require('../../../lib/utils/check-property');
var path = require('canonical-path');
var _ = require('lodash');

module.exports = [
  {
    name: 'ngdoc',
    required: true,
    docProperty: 'docType',
    transformFn: function(doc, tag) {

      // compute componentType
      var componentTypeMap = {
        directive: 'directive',
        input: 'directive',
        filter: 'filter',
        object: 'global',
        type: 'global',
        function: 'global'
      };
      doc.componentType = componentTypeMap[tag.description] || '';

      return tag.description;
    }
  },


  {
    name: 'module',
    defaultFn: function(doc) {
      if ( doc.fileType === 'js' ) {
        checkProperty(doc, 'file');
        checkProperty(doc, 'basePath');
        return path.relative(doc.basePath, path.dirname(doc.file)).split('/')[1];
      }
    }
  },


  {
    name: 'section',
    defaultFn: function(doc) {
      // Code files are put in the api section
      // Other files compute their section from the first path segment
      return (doc.fileType === 'js') ? 'api' : path.relative(doc.basePath, doc.file).split('/').shift();
    }
  },


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
      return codeName.getAbsoluteCodeName(doc, tag.description);
    }
  },


  {
    name: 'id',
    defaultFn: function(doc) {
      if ( doc.fileType === 'js' ) {
        checkProperty(doc, 'componentType');
        checkProperty(doc, 'module');
        checkProperty(doc, 'name');

        if ( doc.memberof ) {
          return doc.memberof + '#' + doc.name;
        } else if ( doc.docType === 'module' ) {
          return 'module:' + doc.module;
        } else {
          var type = doc.componentType ? (doc.componentType + ':') : '';
          return 'module:' + doc.module + '.' + type + doc.name;
        }
      } else {
        // use the document name if provided or the filename, stripped of its extension
        return doc.name || path.basename(doc.file, '.' + doc.fileType);
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
    name: 'restrict',
    defaultFn: function(doc) {
      checkProperty(doc, 'componentType');
      if ( doc.componentType === 'directive') {
        return { element: false, attribute: true, cssClass: false, comment: false };
      }
    },
    transformFn: function(doc, tag) {
      return {
        element: _.contains(tag.description, 'E'),
        attribute: _.contains(tag.description, 'A'),
        cssClass: _.contains(tag.description, 'C'),
        comment: _.contains(tag.description, 'M')
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


  {
    name: 'eventType',
    transformFn: function(doc, tag) {
      var EVENTTYPE_REGEX = /^([^\s]*)\s+on\s+([\S\s]*)/;
      var match = EVENTTYPE_REGEX.exec(tag.description);
      // Attach the target to the doc
      doc.eventTarget = codeName.getAbsoluteCodeName(doc, match[2]);
      // And return the type
      return match[1];
    }
  },


  {
    name: 'example',
    multi: true,
    docProperty: 'examples'
  },


  {
    name: 'element',
    defaultFn: function(doc) {
      if ( doc.componentType === 'directive' ) {
        return'ANY';
      }
    }
  },
  
  {
    name: 'requires',
    multi: true,
    transformFn: function(doc, tag) { return codeName.getAbsoluteCodeName(doc, tag.description); }
  },

  {
    name: 'scope',
    transformFn: function(doc, tag) { return true; }
  },

  {
    name: 'priority',
    defaultFn: function(doc) { return 0; }
  },

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
