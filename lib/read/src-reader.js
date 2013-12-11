var fs = require('q-io/fs');
var Q = require('q');

var reader = {
  /**
   * Read the documentation from files in a folder
   * @param  {string}path                           Path to the folder to read from
   * @param  {regex} pattern                        Pattern that matches files to read
   * @param  {function(file, content)} extractDocFn Function to extract the docs from the file content
   * @return {promise}                              A promise to an array of docs that have been extracted
   */
  readDocs: function(path, pattern, extractDocFn) {
    return fs.listTree(path).then(function(files) {
      var docPromises = [];
      
      files.forEach(function(file) {
        if ( pattern.test(file) ) {
          var docPromise = fs.read(file).then(function(content) {
            return extractDocFn(file, content);
          });
          docPromises.push(docPromise);
        }
      });
      return Q.all(docPromises);
    });
  }
};

module.exports = reader;