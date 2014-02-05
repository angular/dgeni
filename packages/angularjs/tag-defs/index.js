var checkProperty = require('../../../lib/utils/check-property');
var path = require('canonical-path');
var _ = require('lodash');

module.exports = [
  {
    name: 'ngdoc',
    required: true,
    docProperty: 'docType'
  },


  {
    name: 'name',
    required: true,
    transformFn: function(doc, tag) {
      var INPUT_TYPE = /input\[(.+)\]/;
      var name = tag['description'];
      if ( doc.docType === 'input' ) {
        var match = INPUT_TYPE.exec(name);
        if ( !match ) {
          throw new Error('Invalid input directive name.  It should be of the form: "input[inputType]" but was "' + doc.name + '"');
        }
        doc.inputType = match[1];
      }
      return name;
    }
  },
  

  {
    name: 'area',
    defaultFn: function(doc) {
      // Code files are put in the 'api' area
      // Other files compute their area from the first path segment
      return (doc.fileType === 'js') ? 'api' : doc.file.split('/')[0];
    }
  },


  {
    name: 'module',
    defaultFn: function(doc) {
      if ( doc.area === 'api' ) {
        checkProperty(doc, 'file');
        // Calculate the module from the second segment of the file path
        // (the first being the area)
        return path.dirname(doc.file).split('/')[1];
      }
    }
  },


  {
    name: 'id',
    defaultFn: function(doc) {
      var partialFolder = 'partials';
      if ( doc.area === 'api' && doc.docType !== 'overview' ) {
        if ( doc.docType === 'module' ) {
          doc.id = _.template('module:${name}', doc);
          doc.outputPath = _.template('${area}/${name}/index.html', doc);
          doc.path = _.template('${area}/${name}', doc);

        } else if ( doc.name.indexOf('#' ) === -1 ) {
          doc.id = _.template('module:${module}.${docType}:${name}', doc);
          doc.outputPath = _.template('${area}/${module}/${docType}/${name}.html', doc);
          doc.path = _.template('${area}/${module}/${docType}/${name}', doc);

        } else {
          doc.id = doc.name;
          doc.isMember = true;
          doc.memberof = doc.id.split('#')[0];
          // This is a member of another doc so it doesn't need an output path
        }
      } else {
        doc.id = doc.fileName;
        if ( doc.docType === 'error' ) {
          doc.id = doc.name;
        }
        doc.path = path.join(path.dirname(doc.file));
        if ( doc.fileName !== 'index' ) {
          doc.path += '/' + doc.fileName;
        }
        doc.outputPath = doc.path + '.html';
      }

      if ( doc.outputPath ) {
        doc.outputPath = partialFolder + '/' + doc.outputPath;
      }
      
      return doc.id;
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
      if ( doc.docType === 'directive' || doc.docType === 'input' ) {
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
      doc.eventTarget = match[2];
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
      if ( doc.docType === 'directive' || doc.docType === 'input') {
        return'ANY';
      }
    }
  },
  
  {
    name: 'requires',
    multi: true
  },

  {
    name: 'scope',
    transformFn: function(doc, tag) { return true; }
  },

  {
    name: 'priority',
    defaultFn: function(doc) { return 0; }
  },
  
  { name: 'title' },
  { name: 'parent' },

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
