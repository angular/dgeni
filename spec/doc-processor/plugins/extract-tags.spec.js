var _ = require('lodash');
var tagDefs = require('../../../lib/doc-processor/plugins/tag-defs');
var pluginFactory = require('../../../lib/doc-processor/plugins/extract-tags');
var doctrine = require('doctrine');

describe('extract-tags', function() {
  var plugin, doc;

  function setTag(name, description) {
    var tag = _.find(doc.tags, { title: name });
    if ( !tag ) {
      tag = { title: name };
      doc.tags.push(tag);
    }
    tag.description = description;
  }

  function removeTag(name) {
    doc.tags = _.reject(doc.tags, { title: name });
  }


  beforeEach(function() {
    plugin = pluginFactory(tagDefs);
    doc = {
      file: 'src/ngRoute/directive/ngView.js',
      fileType: 'js',
      tags: [
        { title: 'ngdoc', description: 'directive' },
        { title: 'name', description: 'ngView' }
      ]
    };
  });

  describe("ngdoc", function() {
    it("should extract the docType from the ngdoc tag", function() {
      plugin.each(doc);
      expect(doc.docType).toEqual('directive');
    });

    it("should set componentType to be an empty string if the docType is not one of the special types", function() {
      setTag('ngdoc', 'otherType');
      plugin.each(doc);
      expect(doc.componentType).toEqual('');
    });

    it("should set componentType to directive if the docType is a directive type", function() {
      setTag('ngdoc', 'directive');
      plugin.each(doc);
      expect(doc.componentType).toEqual('directive');
      
      setTag('ngdoc', 'input');
      plugin.each(doc);
      expect(doc.componentType).toEqual('directive');
    });

    it("should set componentType to filter if the docType is filter", function() {
      setTag('ngdoc', 'filter');
      plugin.each(doc);
      expect(doc.componentType).toEqual('filter');
    });

    it("should set componentType to global if the docType isa global type", function() {
      setTag('ngdoc', 'object');
      plugin.each(doc);
      expect(doc.componentType).toEqual('global');

      setTag('ngdoc', 'function');
      plugin.each(doc);
      expect(doc.componentType).toEqual('global');
    });
  });

  describe("module", function() {
    it("extracts the module from the module tag if it is there", function() {
      setTag('module', 'ngRoute');
      plugin.each(doc);
      expect(doc.module).toEqual('ngRoute');
    });
    it("extracts the module from the file name if it is a js file", function() {
      plugin.each(doc);
      expect(doc.module).toEqual('ngRoute');

      doc.file = 'src/ng/compile.js';
      plugin.each(doc);
      expect(doc.module).toEqual('ng');
    });
  });

  describe("section", function() {
    it("should extract the section from the tag if it exists", function() {
      setTag('section', 'xyz');
      plugin.each(doc);
      expect(doc.section).toEqual('xyz');
    });
    it("should be 'api' if the fileType is js", function() {
      plugin.each(doc);
      expect(doc.section).toEqual('api');
    });
    it("should compute the section from the file name", function() {
      doc.fileType = 'ngdoc';
      doc.file ='guide/scope/binding.ngdoc';
      plugin.each(doc);
      expect(doc.section).toEqual('guide');
    });
  });


  describe("name", function() {
    it("should extract the name tag into the doc.name property", function() {
      setTag('name','someName');
      plugin.each(doc);
      expect(doc.name).toEqual('someName');
    });

    it("should throw an error if the tag is missing", function() {
      removeTag('name');
      expect(function() {
        plugin.each(doc);
      }).toThrow();
    });
  });


  describe("parentId", function() {
    it("should extract the parentId from eventOf if the doc is an event", function() {
      setTag('ngdoc', 'event');
      setTag('module', 'ng');
      setTag('name', '$includeContentRequested');
      setTag('eventOf', 'module:ng.directive:ngInclude');
      plugin.each(doc);
      expect(doc.parentId).toEqual('module:ng.directive:ngInclude');
    });

    it("should extract the parentId from methodOf if the doc is an method", function() {
      setTag('ngdoc', 'method');
      setTag('module', 'ng');
      setTag('name', 'addControl');
      setTag('methodOf', 'directive:form.FormController');
      plugin.each(doc);
      expect(doc.parentId).toEqual('module:ng.directive:form.FormController');
    });

    it("should extract the parentId from propertyOf if the doc is an property", function() {
      setTag('ngdoc', 'property');
      setTag('module', 'ng');
      setTag('name', 'defaults');
      setTag('propertyOf', '$http');
      plugin.each(doc);
      expect(doc.parentId).toEqual('module:ng.$http');
    });
  });

  describe("id", function() {
    it("should take the tag from the doc if it's there", function() {
      setTag('ngdoc', 'directive');
      setTag('name', 'ngView');
      setTag('module', 'ngRoute');
      setTag('id', 'abc.xyz');
      plugin.each(doc);
      expect(doc.id).toEqual('abc.xyz');
    });
    

    it("should compute the id from the doc's meta data if it's a js file", function() {
      setTag('ngdoc', 'directive');
      setTag('name', 'ngView');
      setTag('module', 'ngRoute');
      plugin.each(doc);
      expect(doc.id).toEqual('module:ngRoute.directive:ngView');

      setTag('ngdoc', 'event');
      setTag('name', '$includeContentRequested');
      setTag('module', 'ng');
      setTag('eventOf', 'directive:ngInclude');
      plugin.each(doc);
      expect(doc.id).toEqual('module:ng.directive:ngInclude#$includeContentRequested');
    });


    it("should compute the id from the name if it's not a js file", function() {
      doc.fileType = 'ngdoc';
      doc.file = 'foobar.ngdoc';
      setTag('ngdoc', 'guide');
      setTag('name', 'abc.xyz');
      plugin.each(doc);
      expect(doc.id).toEqual('abc.xyz');
    });
  });


  describe("param", function() {
    it("should add param tags to a params array on the doc", function() {
      var tags = doctrine.parse(
        '@param {string} paramName description of param\n' +
        '@param {string=} optionalParam description of optional param\n' +
        '@param {string} [paramWithDefault=xyz] description of param with default',
        { sloppy: true } // to allow square brackets in param name
      ).tags;

      doc.tags = doc.tags.concat(tags);

      plugin.each(doc);

      expect(doc.params[0]).toEqual(
      {
        name: 'paramName',
        description: 'description of param',
        type: { description: 'string', optional: false },
        optional: false
      });
      expect(doc.params[1]).toEqual(
      {
        name: 'optionalParam',
        description: 'description of optional param',
        type: { description: 'string', optional: true },
        optional: true
      });
      expect(doc.params[2]).toEqual(
      {
        name: 'paramWithDefault',
        description: 'description of param with default',
        type: { description: 'string', optional: true },
        optional: true,
        default: 'xyz'
      });
    });
  });


  describe("property", function() {

    it("should add a property object to the properties property on the doc", function() {
      doc.tags.push({
        title: 'property',
        name: 'propertyName',
        description: 'description of property',
        type: { type: 'NameExpression', name: 'string' }
      });

      plugin.each(doc);
      expect(doc.properties).toEqual([{
        type: { description: 'string', optional: false },
        name: 'propertyName',
        description: 'description of property'
      }]);
    });

  });


  describe("restrict", function() {

    it("should convert a restrict tag text to an object", function() {

      setTag('restrict', 'A');
      plugin.each(doc);
      expect(doc.restrict).toEqual({ element: false, attribute: true, cssClass: false, comment: false });

      setTag('restrict', 'C');
      plugin.each(doc);
      expect(doc.restrict).toEqual({ element: false, attribute: false, cssClass: true, comment: false });

      setTag('restrict', 'E');
      plugin.each(doc);
      expect(doc.restrict).toEqual({ element: true, attribute: false, cssClass: false, comment: false });

      setTag('restrict', 'M');
      plugin.each(doc);
      expect(doc.restrict).toEqual({ element: false, attribute: false, cssClass: false, comment: true });

      setTag('restrict', 'ACEM');
      plugin.each(doc);
      expect(doc.restrict).toEqual({ element: true, attribute: true, cssClass: true, comment: true });
    });

    it("should default to restricting to an attribute if no tag is found and the doc is for a directive", function() {

      plugin.each(doc);
      expect(doc.restrict).toEqual({ element: false, attribute: true, cssClass: false, comment: false });
    });

    it("should not add a restrict property if the doc is not a directive", function() {

      setTag('ngdoc', 'filter');
      plugin.each(doc);
      expect(doc.restrict).toBeUndefined();
    });
  });


  describe("returns", function() {

    it("should add a returns property to the doc", function() {
      doc.tags.push({
        title: 'returns',
        type: { name: 'string', type: 'NameExpression' },
        description: 'description of returns'
      });
      plugin.each(doc);
      expect(doc.returns).toEqual({
        type: { description: 'string', optional: false },
        description: 'description of returns'
      });
    });

    it("should throw an exception if both return and returns tags are specified", function() {
      doc.tags.push({ title: 'returns' });
      doc.tags.push({ title: 'return' });
      expect(function() { plugin.each(doc); }).toThrow();
    });

  });

  describe("return", function() {

    it("should add a returns property to the doc", function() {
      doc.tags.push({
        title: 'return',
        type: { name: 'string', type: 'NameExpression' },
        description: 'description of returns'
      });
      plugin.each(doc);
      expect(doc.returns).toEqual({
        type: { description: 'string', optional: false },
        description: 'description of returns'
      });
    });

  });


  describe("eventType", function() {

    it("should add an eventType and eventTarget property to the doc", function() {
      setTag('eventType', 'broadcast on module:ng.directive:ngInclude');
      plugin.each(doc);
      expect(doc.eventType).toEqual('broadcast');
      expect(doc.eventTarget).toEqual('module:ng.directive:ngInclude');
    });
  });


  describe("element", function() {
    it("should apply the tag to the doc.element property", function() {
      setTag('element', 'input');
      plugin.each(doc);
      expect(doc.element).toEqual('input');
    });
    it("should default to ANY if the document is a directive", function() {
      plugin.each(doc);
      expect(doc.element).toEqual('ANY');
    });
  });


  describe("requires", function() {

    it("should extract an array of requires information from the tags", function() {
      setTag('module', 'ng');
      setTag('ngdoc', '$http');
      doc.tags = doc.tags.concat([
        { title: 'requires', description: '$compile' },
        { title: 'requires', description: 'directive:ngClick' },
        { title: 'requires', description: 'module:ngRoute.directive:ngView' }
      ]);
      plugin.each(doc);
      expect(doc.requires).toEqual([
        'module:ng.$compile',
        'module:ng.directive:ngClick',
        'module:ngRoute.directive:ngView'
      ]);
    });
  });


});
