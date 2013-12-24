var path = require('canonical-path');
var Q = require('q');
var fs = require('q-io/fs');
var _ = require('lodash');

/**
 * Read the documentation from files in a folder
 * @param  {string}path                           Path to the folder to read from
 * @param  {array<object>} extractors             A collection of doc extractors
 * @return {promise}                              A promise to an array of docs that have been extracted
 */
module.exports = function fileReaderFactory(extractors) {
  return function(filePath) {
    return fs.listTree(filePath).then(function(files) {
      var docPromises = [];
      
      files.forEach(function(file) {
        var i, extractor;
        for(i=0; i<extractors.length; i++) {

          extractor = extractors[i];
          if ( extractor.pattern.test(file) ) {
          
            docPromises.push(fs.read(file).then(function(content) {
              return extractor.processFile(path.canonical(file), content);
            }));
          
            break;
          }
        }
      });
      return Q.all(docPromises).then(function(docs) {
        // We need to flatten the array because Q.all() resolves the array of promises
        // into an array of an array of docs
        return _.flatten(docs);
      });
    });
  };
};