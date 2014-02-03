var plugin = require('../../processors/examples-docs');
var configurer = require('../../../../lib/utils/config');

describe("examples-docs processor", function() {
  beforeEach(function() {
    plugin.init(configurer.load(), { value: function() { }});
  });
  it("should add new documents that represent the examples", function() {
    var docs = [ { file: 'a.b.js' }];
    var examples = [
      {
        id: 'a.b.c',
        doc: docs[0],
        files: [
          { type: 'js', name: 'app.js' },
          { type: 'css', name: 'app.css' },
          { type: 'spec', name: 'app.spec.js' }
        ]
      }
    ];

    plugin.process(docs, examples);

    expect(docs[1]).toEqual(
      jasmine.objectContaining({ docType: 'example', template: 'examples/index.template.html' })
    );
    expect(docs[2]).toEqual(
      jasmine.objectContaining({ docType: 'example-js', template: 'examples/template.js' })
    );
    expect(docs[3]).toEqual(
      jasmine.objectContaining({ docType: 'example-css', template: 'examples/template.css' })
    );
    expect(docs[4]).toEqual(
      jasmine.objectContaining({ docType: 'example-spec', template: 'examples/template.spec' })
    );
  });
});