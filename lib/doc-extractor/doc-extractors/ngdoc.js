/**
 * @description
 * This extractor will pull the content from an ngdoc file
 * The doc will initially have the form:
 * {
 *   fileType: 'ngdoc',
 *   file: 'path/to/file.ngdoc'
 *   content: 'the content of the file',
 * }
 */
module.exports = {
  pattern: /\.ngdoc$/,
  processFile: function(filePath, contents, basePath) {
    // We return a single element array because ngdoc files only contain one document
    return [{
      content: contents,
      file: filePath,
      basePath: basePath,
      fileType: 'ngdoc',
      startingLine: 1
    }];
  }
};