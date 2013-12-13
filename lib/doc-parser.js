var _ = require('lodash');
var path = require('path');
var contentParser = require('./content-parser');
var ngDocTagProcessor = require('./ngdoc');

/**
 * calculate some metadata from the tags that were found
 * @param  {object} doc the document object to update
 */
function addMetaData(doc) {
  doc.id = doc.id || doc.name;

  // I don't like this big switch here but we need to wait until the jsdoc tags have been
  // parsed to know what the doc.name is...
  switch(doc.fileType) {
    case 'ngdoc':
      doc.path = doc.folder;
      break;
    case 'js':
      var pathParts = doc.name.split('/');
      doc.path = 'api/' + pathParts.join('/');
      doc.moduleName = pathParts[0];
      if ( doc.name.indexOf('angular') === 0 ) {
        doc.moduleName = 'ng';
      }
      doc.shortName = pathParts.pop();
      break;
  }
}

function parse(originalDoc, tagHandlers, contentParsers) {
  var parseContent = contentParserFactory(contentParsers);
  var processNgDocTags = ngDocTagProcessor(tagHandlers, parseContent);

  var doc = _.defaults({}, originalDoc);
  processNgDocTags(doc);
  addMetaData(doc);

  return doc;
}

module.exports = parse;