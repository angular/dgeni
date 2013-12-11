/**
 * This module contains functions for parsing file content to extract documents
 */
var NGDOC_FILE_ID = /.*(\/|\\)([^(\/|\\)]*)\.ngdoc/;
var DOC_COMMENT_START = /^\s*\/\*\*\s*(.*)$/;
var LEADING_STAR = /^\s*\*\s?/;
var END_COMMENT = /\*\//;
var NEW_LINE = /\n\r?/;
var BLANK_LINE = /^\n\r?/;
var NGDOC_TAG = /@ngdoc/;

module.exports = {

  /**
   * Extract documents from an ngdoc file
   * @param  {string} file    path to the file
   * @param  {string} content the contents of the file
   * @return {array}          a collection of documents extracted from the file
   */
  extractNgdoc: function(file, content) {
    // We return a single element array as ngdocs only contain one doc
    return [{
      content: content,
      file: file,
      id: (NGDOC_FILE_ID.exec(file)||{})[2],  // extract the id from the filename
      type: 'ngdoc'
    }];
  },

  /**
   * Extract documents from a JavaScript file
   * @param  {string} file    path to the file
   * @param  {string} content the contents of the file
   * @return {array}          a collection of documents extracted from the file
   */
  extractDocsFromJs: function(file, content) {
    var docs = [];
    var lines = content.toString().split(NEW_LINE);
    var text, startingLine, match;
    var inDoc = false;

    lines.forEach(function(line, lineNumber){
      lineNumber++;
  
      // is the comment starting?
      if (!inDoc && (match = line.match(DOC_COMMENT_START))) {
        line = match[1];
        inDoc = true;
        text = [];
        startingLine = lineNumber;
      }
  
      // are we done?
      if (inDoc && line.match(END_COMMENT)) {
        text = text.join('\n').replace(BLANK_LINE, '');
        if (text.match(NGDOC_TAG)){
          docs.push({
            content: text,
            file: file,
            startingLine: startingLine,
            type: 'js'
          });
        }
        inDoc = false;
      }

      // we are in a doc comment so add text (removing leading stars)
      if (inDoc){
        text.push(line.replace(LEADING_STAR, ''));
      }
    });

    return docs;
  }
};