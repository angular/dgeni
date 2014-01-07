var path = require('canonical-path');
var Q = require('q');
var gfs = require('graceful-fs');
var qfs = require('q-io/fs');
var _ = require('lodash');
var log = require('winston');

module.exports = function fileReaderFactory(extractors) {
  /**
   * Read the documentation from files in a folder
   * @param  {Array} filePaths                      Array of paths in which to search for files to load
   * @return {promise}                              A promise to an array of docs that have been extracted
   */
  return function(filePaths) {

    return Q.all(_.map(filePaths, function(filePath) {

      return qfs.listTree(filePath).then(function(files) {

        var docPromises = [];

        _.forEach(files, function(file) {

          var relativeFilePath = path.relative(path.dirname(filePath), file);

          _.any(extractors, function(extractor) {

            if ( extractor.pattern.test(file) ) {

              docPromises.push(qfs.read(file).then(function(content) {
                return extractor.processFile(relativeFilePath, content, filePath);
              }));

              return true;
            }
          });
        });

        return Q.all(docPromises).then(_.flatten);
      });
    }))
    
    .then(_.flatten);
  };
};