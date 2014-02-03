var _ = require('lodash');
var log = require('winston');
var walk = require('../../../lib/utils/walk');
var fs = require('fs');
var path = require('canonical-path');

// Keywords to ignore
var wordsToIgnore = [];

// Keywords start with "ng:" or one of $, _ or a letter
var KEYWORD_REGEX = /^((ng:|[\$_a-z])[\w\-_]+)/;

module.exports = {
  name: 'keywords',
  runAfter: ['docs-processed'],
  runBefore: ['adding-extra-docs'],
  description: 'This processor extracts all the keywords from the document',
  init: function(config) {

    // Load up the keywords to ignore, if specified in the config
    if ( config.processing.search && config.processing.search.ignoreWordsFile ) {

      var ignoreWordsPath = path.resolve(config.basePath, config.processing.search.ignoreWordsFile);
      wordsToIgnore = fs.readFileSync(ignoreWordsPath, 'utf8').toString().split(/[,\s\n\r]+/gm);

    }
  },
  process: function(docs) {

    // keywordMap holds a map of words that have been found already
    var keywordMap = _.indexBy(wordsToIgnore);
    var words = [];

    // If the title contains a name starting with ng, e.g. "ngController", then add the module name
    // without the ng to the title text, e.g. "controller".
    function extractTitleWords(title) {
      var match = /ng([A-Z]\w*)/.exec(title);
      if ( match ) {
        title = title + ' ' + match[1].toLowerCase();
      }
      return title;
    }

    function extractWords(text) {
      if (_.isString(text)) {
        var tokens = text.toLowerCase().split(/[\.\s,`'"#]+/mg);
        _.forEach(tokens, function(token){
          var match = token.match(KEYWORD_REGEX);
          if (match){
            key = match[1];
            if ( !keywordMap[key]) {
              keywordMap[key] = true;
              words.push(key);
            }
          }
        });
      }
      return text;
    }

    _.forEach(docs, function(doc) {

      walk(doc, extractWords);

      doc.searchTerms = {
        titleWords: extractTitleWords(doc.name),
        keywords: _.sortBy(words).join(' ')
      };
    });
  }
};