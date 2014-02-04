var _ = require('lodash');
var path = require('canonical-path');

module.exports = {
  name: 'output-path',
  description: 'This plugin will compute the output path to the rendered file of each document',
  runAfter: ['parent'],
  runBefore: ['rendering-docs'],
  init: function(config, injectables) {
    injectables.value('partialFolder', (config && config.rendering && config.rendering.partialFolder) || 'partials');
  },
  process: function(docs, partialFolder) {

    _.forEach(docs, function(doc) {
      
      if ( doc.outputPath ) return;

      if ( doc.fileType === 'js' ) {

        // The document is an API component so compute its path from the doc's properties
        switch(doc.docType) {
          case 'module':
            doc.outputPath = _.template('${area}/${name}/index.html', doc);
            break;
          case 'componentGroup':
            doc.outputPath = _.template('${area}/${module}/${groupType}/index.html', doc);
            break;
          default:
            doc.outputPath = _.template('${area}/${module}/${docType}/${name}.html', doc);
            break;
        }

      } else {
        
        var folder = path.dirname(doc.file);
        // The document is a guide or tutorial, etc. Calculate the output path from its original file name
        doc.outputPath = path.join(doc.area, folder, doc.fileName + '.html' );

      }

      doc.outputPath = partialFolder + '/' + doc.outputPath;

    });
  }
};