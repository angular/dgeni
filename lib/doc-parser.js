var _ = require('lodash');
var path = require('path');
var contentParser = require('./content-parser');
var jsDocTagProcessor = require('./jsdoc-tags-processor');

/**
 * calculate some metadata from the tags that were found
 * @param  {object} doc the document object to update
 */
function addMetaData(doc, parseContent) {
  doc.id = doc.id || doc.name;

  // I don't like this big switch here but we need to wait until the jsdoc tags have been
  // parsed to know what the doc.name is...
  switch(doc.fileType) {
    case 'ngdoc':
      doc.path = doc.folder;
      break;
    case 'js':
      var pathParts = doc.name.split('/');
      doc.shortName = pathParts.pop();
      doc.path = 'api/' + pathParts.join('/');
      doc.moduleName = pathParts[0];
      if ( doc.moduleName == 'angular' ) {
        doc.moduleName = 'ng';
      }
      break;
  }
  if ( doc.fileType === 'js' ) {
    // docs extracted from JS files are in the api section
    doc.breadcrumbs.unshift('api');
  }
}

function parse(originalDoc, tagHandlers, contentParsers) {
  var parseContent = contentParserFactory(contentParsers);
  var processJsDocTags = jsDocTagProcessor(tagHandlers, parseContent);

  var doc = _.defaults({}, originalDoc);
  processJsDocTags(doc);
  addMetaData(doc, parseContent);

  return doc;
}

module.exports = parse;