var codeName = require('../..//utils/code-name');
var checkProperty = require('../../utils/check-property');
var tagUtil = require('../../utils/tags');
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
        doc.module = doc.file.split('/')[1];
      }
    }
  },


  {
    name: 'section',
    defaultFn: function(doc) {
      // Code files are put in the api section
      // Other files compute their section from the first path segment
      doc.section = (doc.fileType === 'js') ? 'api' : path.dirname(doc.file).split('/').shift();
    }
  },


  {
    name: 'name',
    required: true
  },
  

  {
    name: 'eventOf',
    docProperty: 'parentId',
    defaultFn: function(doc) {
      if ( doc.docType === 'event' ) {
        throw new Error('Missing tag "eventOf" for doc of type "event" in file "' + doc.file + '" at line ' + doc.startingLine);
      }
    },
    transformFn: function(doc, tag) {
      if ( doc.docType !== 'event' ) {
        throw new Error('eventOf tag found on non-event document in file "' + doc.file + '" at line ' + doc.startingLine);
      }
      return codeName.getAbsoluteCodeName(doc, tag.description);
    }
  },


  {
    name: 'methodOf',
    docProperty: 'parentId',
    defaultFn: function(doc) {
      if ( doc.docType === 'method' ) {
        throw new Error('Missing tag "methodOf" for doc of type "method" in file "' + doc.file + '" at line ' + doc.startingLine);
      }
    },
    transformFn: function(doc, tag) {
      if ( doc.docType !== 'method' ) {
        throw new Error('methodOf tag found on non-method document in file "' + doc.file + '" at line ' + doc.startingLine);
      }
      return codeName.getAbsoluteCodeName(doc, tag.description);
    }
  },


  {
    name: 'propertyOf',
    docProperty: 'parentId',
    defaultFn: function(doc) {
      if ( doc.docType ==='property' ) {
        throw new Error('Missing tag "propertyOf" for doc of type "property" in file "' + doc.file + '" at line ' + doc.startingLine);
      }
    },
    transformFn: function(doc, tag) {
      if ( doc.docType !== 'property' ) {
        throw new Error('propertyOf tag found on non-property document in file "' + doc.file + '" at line ' + doc.startingLine);
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

        if ( doc.parentId ) {
          doc.id = doc.parentId + '#' + doc.name;
        } else if ( doc.docType === 'module' ) {
          doc.id = 'module:' + doc.module;
        } else {
          var type = doc.componentType ? (doc.componentType + ':') : '';
          doc.id = 'module:' + doc.module + '.' + type + doc.name;
        }
      } else {
        // use the document name if provided or the filename, stripped of its extension
        doc.id = doc.name || path.basename(doc.file, '.' + doc.fileType);
      }
    }
  },

  {
    name: 'param',
    multi: true,
    docProperty: 'params',
    transformFn: function(doc, tag) {
      // doctrine doesn't support param name aliases
      var match = /^(?:\|(\S+)\s)?(.*)/.exec(tag.description);
      var alias = match[1];
      var description = match[2];
      var param = {
        name: tag.name,
        description: description,
        type: tagUtil.getType(tag),
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
        type: tagUtil.getType(tag),
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
        doc.restrict = { element: false, attribute: true, cssClass: false, comment: false };
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
        type: tagUtil.getType(tag),
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
        doc.element = 'ANY';
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
    defaultFn: function(doc) { doc.priority = 0; }
  },

  { name: 'description' },
  { name: 'usage' },
  { name: 'animations' }

];