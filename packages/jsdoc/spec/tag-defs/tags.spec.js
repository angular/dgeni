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
      name: { title: 'name', description: 'someComponent' }
    });
    doc = {
      basePath: '.',
      file: 'src/some.js',
      fileType: 'js',
      tags: tags
    };
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


});
