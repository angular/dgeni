// var rewire = require('rewire');
// var checkLinks = rewire('../../../lib/doc-processor/doc-processor-plugins/check-links');


// describe("check-links doc-processor plugin", function() {
//   var log = [];
//   it("should check that any links in the links property of a doc reference a valid doc", function() {
    
//     checkLinks.__set__('console', { log: function(value) { log.push(value); } });
    
//     var docs = [
//       { id: 'a' },
//       { id: 'b', links: ['a', 'c'] },
//       { id: 'c', param: { links : ['d', 'inner-bad'] } },
//       { id: 'd', links: ['bad'] }
//     ];

//     checkLinks(docs);

//     expect(log).toEqual([
//       'ERROR: invalid link, "inner-bad" in doc "c"',
//       'ERROR: invalid link, "bad" in doc "d"'
//     ]);
//   });
// });