var _ = require('lodash');
var logger = require('winston');
var tagDefs = require('../../tag-defs');
var MockTags = require('../mockTags.js');

describe('tag definitions', function() {
  var doc, tags, tagDef;

  var getTagDef = function(name) {
    return _.find(tagDefs, { name: name });
  };

  beforeEach(function() {
    tags = new MockTags({
      ngdoc: { title: 'ngdoc', description: 'directive' },
      name: { title: 'name', description: 'ngView' }
    });
    doc = {
      basePath: '.',
      file: 'src/ngRoute/directive/ngView.js',
      fileType: 'js',
      tags: tags
    };
  });

  describe("ngdoc", function() {
    beforeEach(function() {
      tagDef = getTagDef('ngdoc');
    });

    it("should extract the docType from the ngdoc tag", function() {
      expect(tagDef.transformFn(doc, tags.getTag('ngdoc'))).toEqual('directive');
    });

    it("should set componentType to be an empty string if the docType is not one of the special types", function() {
      tags.getTag('ngdoc').description = 'otherType';
      tagDef.transformFn(doc, tags.getTag('ngdoc'));
      expect(doc.componentType).toEqual('');
    });

    it("should set componentType to directive if the docType is a directive type", function() {
      tagDef.transformFn(doc, tags.getTag('ngdoc'));
      expect(doc.componentType).toEqual('directive');
      
      tags.getTag('ngdoc').description = 'input';
      tagDef.transformFn(doc, tags.getTag('ngdoc'));
      expect(doc.componentType).toEqual('directive');
    });

    it("should set componentType to filter if the docType is filter", function() {
      tags.getTag('ngdoc').description = 'filter';
      tagDef.transformFn(doc, tags.getTag('ngdoc'));
      expect(doc.componentType).toEqual('filter');
    });

    it("should set componentType to global if the docType isa global type", function() {
      tags.getTag('ngdoc').description = 'object';
      tagDef.transformFn(doc, tags.getTag('ngdoc'));
      expect(doc.componentType).toEqual('global');

      tags.getTag('ngdoc').description = 'type';
      tagDef.transformFn(doc, tags.getTag('ngdoc'));
      expect(doc.componentType).toEqual('global');

      tags.getTag('ngdoc').description = 'function';
      tagDef.transformFn(doc, tags.getTag('ngdoc'));
      expect(doc.componentType).toEqual('global');
    });

  });

  describe("module", function() {
    beforeEach(function() {
      tagDef = getTagDef('module');
    });

    it("extracts the module from the file name if it is a js file", function() {
      expect(tagDef.defaultFn(doc)).toEqual('ngRoute');

      doc.file = 'src/ng/compile.js';
      expect(tagDef.defaultFn(doc)).toEqual('ng');
    });
  });

  describe("area", function() {
    beforeEach(function() {
      tagDef = getTagDef('area');
    });

    it("should be 'api' if the fileType is js", function() {
      expect(tagDef.defaultFn(doc)).toEqual('api');
    });

    it("should compute the area from the file name", function() {
      doc.fileType = 'ngdoc';
      doc.file ='guide/scope/binding.ngdoc';
      expect(tagDef.defaultFn(doc)).toEqual('guide');
    });
  });


  describe("name", function() {
    beforeEach(function() {
      tagDef = getTagDef('name');
    });

    it("should throw an error if the tag is missing", function() {
      expect(function() {
        tagDef.defaultFn(doc);
      }).toThrow();
    });

    it("should throw error if the docType is 'input' and the name is not a valid format", function() {
      var doc = { docType: 'input' };
      var tag = { title: 'name', description: 'input[checkbox]' };
      expect(tagDef.transformFn(doc, tag)).toEqual('input[checkbox]');
      expect(doc.inputType).toEqual('checkbox');

      doc = { docType: 'directive' };
      tagDef.transformFn(doc, tag);
      expect(doc.inputType).toBeUndefined();

      doc = { docType: 'input'};
      tag = { title: 'name', description: 'invalidInputName' };
      expect(function() {
        tagDef.transformFn(doc, tag);
      }).toThrow();
      
    });

  });


  describe("memberof", function() {
    beforeEach(function() {
      tagDef = getTagDef('memberof');
    });

    it("should throw an exception if the tag exists and docType is not 'event', 'method' or 'property'", function() {
      expect(function() {
        tagDef.transformFn(doc, {});
      }).toThrow();
    });

    it("should throw an exception if the tag doesn't exist and docType is 'event', 'method' or 'property'", function() {
      expect(function() {
        doc.docType = 'event';
        tagDef.defaultFn(doc, {});
      }).toThrow();
      expect(function() {
        doc.docType = 'property';
        tagDef.defaultFn(doc, {});
      }).toThrow();
      expect(function() {
        doc.docType = 'method';
        tagDef.defaultFn(doc, {});
      }).toThrow();
    });

    it("should extract the parent id from memberof if the doc is an event, method or property", function() {
      doc.docType = 'event';
      expect(tagDef.transformFn(doc, { title: 'memberof', description: 'module:ng.directive:ngInclude' }))
          .toEqual('module:ng.directive:ngInclude');

      doc.docType = 'method';
      doc.module = 'ng';
      expect(tagDef.transformFn(doc, { title: 'memberof', description: 'directive:form.FormController' }))
          .toEqual('module:ng.directive:form.FormController');

      doc.docType = 'property';
      doc.componentType = '';
      expect(tagDef.transformFn(doc, { title: 'memberof', description: '$http' })).toEqual('module:ng.$http');
    });
  });

  describe("id", function() {
    beforeEach(function() {
      tagDef = getTagDef('id');
    });

    it("should compute the id from the doc's meta data if it's a js file", function() {
      doc.docType = 'directive';
      doc.componentType = 'directive';
      doc.name = 'ngView';
      doc.module = 'ngRoute';
      expect(tagDef.defaultFn(doc)).toEqual('module:ngRoute.directive:ngView');

      doc.docType = 'event';
      doc.componentType = '';
      doc.name = '$includeContentRequested';
      doc.module = 'ng';
      doc.memberof = 'module:ng.directive:ngInclude';
      expect(tagDef.defaultFn(doc)).toEqual('module:ng.directive:ngInclude#$includeContentRequested');
    });


    it("should compute the id from the name if it's not a js file", function() {
      doc.fileType = 'ngdoc';
      doc.file = 'foobar.ngdoc';
      doc.docType = 'guide';
      doc.name = 'abc.xyz';
      expect(tagDef.defaultFn(doc)).toEqual('abc.xyz');
    });
  });


  describe("param", function() {
    beforeEach(function() {
      tagDef = getTagDef('param');
    });

    it("should add param tags to a params array on the doc", function() {
      var param;

      doc.tags = new MockTags([
        { title: 'param', name: 'paramName', description: 'description of param', type: { description: 'string', optional: false, typeList: ['string'] } },
        { title: 'param', name: 'optionalParam', description: 'description of optional param', type: { description: 'string', optional: true, typeList: ['string']  } },
        { title: 'param', name: 'paramWithDefault', description: 'description of param with default', default: 'xyz', type: { description: 'string', optional: true, typeList: ['string']  } },
        { title: 'param', name: 'paramName', description: '|alias description of param with alias', type: { description: 'string', optional: false, typeList: ['string']  } }
      ]);

      param = tagDef.transformFn(doc, doc.tags.tags[0]);
      expect(param).toEqual(
      {
        name: 'paramName',
        description: 'description of param',
        type: { description: 'string', optional: false, typeList: ['string'] }
      });

      param = tagDef.transformFn(doc, doc.tags.tags[1]);
      expect(param).toEqual(
      {
        name: 'optionalParam',
        description: 'description of optional param',
        type: { description: 'string', optional: true, typeList: ['string']  }
      });

      param = tagDef.transformFn(doc, doc.tags.tags[2]);
      expect(param).toEqual(
      {
        name: 'paramWithDefault',
        description: 'description of param with default',
        type: { description: 'string', optional: true, typeList: ['string']  },
        default: 'xyz'
      });

      param = tagDef.transformFn(doc, doc.tags.tags[3]);
      expect(param).toEqual(
      {
        name: 'paramName',
        description: 'description of param with alias',
        type: { description: 'string', optional: false, typeList: ['string']  },
        alias: 'alias'
      });
    });
  });


  describe("property", function() {
    beforeEach(function() {
      tagDef = getTagDef('property');
    });

    it("should transform into a property object", function() {
      var tag = {
        title: 'property',
        name: 'propertyName',
        description: 'description of property',
        type: { description: 'string', optional: false, typeList: ['string']  }
      };

      expect(tagDef.transformFn(doc, tag)).toEqual({
        type: { description: 'string', optional: false, typeList: ['string']  },
        name: 'propertyName',
        description: 'description of property'
      });
    });

  });


  describe("restrict", function() {
    beforeEach(function() {
      tagDef = getTagDef('restrict');
    });


    it("should convert a restrict tag text to an object", function() {

      expect(tagDef.transformFn(doc, { title: 'restrict', description: 'A' }))
        .toEqual({ element: false, attribute: true, cssClass: false, comment: false });

      expect(tagDef.transformFn(doc, { title: 'restrict', description: 'C' }))
        .toEqual({ element: false, attribute: false, cssClass: true, comment: false });

      expect(tagDef.transformFn(doc, { title: 'restrict', description: 'E' }))
        .toEqual({ element: true, attribute: false, cssClass: false, comment: false });

      expect(tagDef.transformFn(doc, { title: 'restrict', description: 'M' }))
        .toEqual({ element: false, attribute: false, cssClass: false, comment: true });

      expect(tagDef.transformFn(doc, { title: 'restrict', description: 'ACEM' }))
        .toEqual({ element: true, attribute: true, cssClass: true, comment: true });
    });

    it("should default to restricting to an attribute if no tag is found and the doc is for a directive", function() {
      doc.componentType = 'directive';
      expect(tagDef.defaultFn(doc)).toEqual({ element: false, attribute: true, cssClass: false, comment: false });
    });

    it("should not add a restrict property if the doc is not a directive", function() {
      doc.componentType = '';
      expect(doc.restrict).toBeUndefined();
    });
  });


  describe("returns/return", function() {
    beforeEach(function() {
      tagDef = getTagDef('returns');
    });


    it("should transform into a returns object", function() {
      expect(tagDef.transformFn(doc, {
        title: 'returns',
        type: { description: 'string', optional: false, typeList: ['string']  },
        description: 'description of returns'
      }))
      .toEqual({
        type: { description: 'string', optional: false, typeList: ['string']  },
        description: 'description of returns'
      });
    });

  });


  describe("eventType", function() {
    beforeEach(function() {
      tagDef = getTagDef('eventType');
    });


    it("should add an eventTarget property to the doc and return the event type", function() {
      var tag = { title: 'eventType', description: 'broadcast on module:ng.directive:ngInclude' };
      expect(tagDef.transformFn(doc, tag)).toEqual('broadcast');
      expect(doc.eventTarget).toEqual('module:ng.directive:ngInclude');
    });
  });


  describe("element", function() {
    beforeEach(function() {
      tagDef = getTagDef('element');
    });

    it("should default to ANY if the document is a directive", function() {
      doc.componentType = 'directive';
      expect(tagDef.defaultFn(doc)).toEqual('ANY');

      doc.componentType = 'filter';
      expect(tagDef.defaultFn(doc)).toBeUndefined();
    });
  });


  describe("requires", function() {
    beforeEach(function() {
      tagDef = getTagDef('requires');
    });


    it("should transform the code name to an absolute form", function() {
      doc.module = 'ng';
      doc.name = '$http';
      doc.docType = 'service';
      doc.componentType = '';
      expect(tagDef.transformFn(doc, { title: 'requires', description: '$compile' }))
        .toEqual('module:ng.$compile');
      expect(tagDef.transformFn(doc, { title: 'requires', description: 'directive:ngClick' }))
        .toEqual('module:ng.directive:ngClick');
      expect(tagDef.transformFn(doc, { title: 'requires', description: 'module:ngRoute.directive:ngView' }))
        .toEqual('module:ngRoute.directive:ngView');
    });
  });


});
