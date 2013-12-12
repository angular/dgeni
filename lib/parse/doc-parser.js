var _ = require('lodash');
var trimIndentation = require('../utils/trim-indentation');
var parseMarkdown = require('./parse-markdown');

var NEW_LINE = /\n\r?/;
var JSDOC_TAG = /^\s*@(\w+)(\s+(.*))?/;
                  //  1     1     23       3   4   4 5      5  2   6  6
var PARAM_REGEX = /^\{([^}]+)\}\s+(([^\s=]+)|\[(\S+)=([^\]]+)\])\s+(.*)/; 
var RETURN_REGEX = /^\{([^}]+)\}\s+(.*)/;
var REQUIRES_REGEX = /^([^\s]*)\s*([\S\s]*)/;
var PROPERTY_REGEX = /^\{(\S+)\}\s+(\S+)(\s+(.*))?/;
var EVENTTYPE_REGEX = /^([^\s]*)\s+on\s+([\S\s]*)/;

function getShortName(doc) {
  return doc.name.split('/').pop().trim();
}
function getId(doc) {
  return doc.id || doc.name;
}

function getModuleName(doc) {
  var module = doc.id.split(/[.\/]/)[0];
  if(module == 'angular') {
    module = 'ng';
  }
  return module;
}

function processTag(currentTag, doc, line) {
  var text, match;
  text = trimIndentation(currentTag.text.join('\n'));

  switch(currentTag.name) {
    case 'param':
      match = PARAM_REGEX.exec(text);
      if (!match) {
        throw new Error("Not a valid 'param' format: " + text + ' (found in: ' + doc.file + ':' + line + ')');
      }

      var optional = (match[1].slice(-1) === '=');
      var param = {
        name: match[4] || match[3],
        description: parseMarkdown(text.replace(match[0], match[6]), doc),
        type: optional ? match[1].substring(0, match[1].length-1) : match[1],
        optional: optional,
        default: match[5]
      };
      doc.params.push(param);
      break;
    case 'returns':
    case 'return':
      match = RETURN_REGEX.exec(text);
      if (!match) {
        throw new Error("Not a valid 'returns' format: " + text + ' (found in: ' + doc.file + ':' + line + ')');
      }
      doc.returns = {
        type: match[1],
        description: parseMarkdown(text.replace(match[0], match[2]))
      };
      break;
    case 'requires':
      match = REQUIRES_REGEX.exec(text);
      doc.requires.push({
        name: match[1],
        text: parseMarkdown(match[2])
      });
      break;
    case 'property':
      match = PROPERTY_REGEX.exec(text);
      if (!match) {
        throw new Error("Not a valid 'property' format: " + text + ' (found in: ' + doc.file + ':' + line + ')');
      }
      doc.properties.push({
        type: match[1],
        name: match[2],
        shortName: match[2],
        description: parseMarkdown(text.replace(match[0], match[4]))
      });
      break;
    case 'eventType':
      match = EVENTTYPE_REGEX.exec(text);
      doc.eventType = match[1];
      doc.eventTarget = match[2];
      break;
    default:
      doc[currentTag.name] = text;
  }
}

/** Set up initial collections for stuff
 * @param  {object} doc the document object to initialize
 */
function initDoc(doc) {
  doc.scenarios = doc.scenarios || [];
  doc.requires = doc.requires || [];
  doc.params = doc.params || [];
  doc.properties = doc.properties || [];
  doc.methods = doc.methods || [];
  doc.events = doc.events || [];
  doc.links = doc.links || [];
  doc.anchors = doc.anchors || [];
}

/**
 * calculate some metadata from the tags that were found
 * @param  {object} doc the document object to update
 */
function updateMetaData(doc) {
  var pageClassName, suffix = '-page', split, before, after;

  doc.shortName = getShortName(doc);
  doc.id = getId(doc);
  doc.moduleName = getModuleName(doc);
  doc.description = parseMarkdown(doc.description);
  doc.example = parseMarkdown(doc.example);
  doc['this'] = parseMarkdown(doc['this']);

  if(doc.name) {
    split = doc.name.match(/^\s*(.+?)\s*:\s*(.+)/);
    if(split && split.length > 1) {
      before = prepareClassName(split[1]);
      after = prepareClassName(split[2]);
      pageClassName = before + suffix + ' ' + before + '-' + after + suffix;
    }
  }
  doc.pageClassName = pageClassName || prepareClassName(doc.name || 'docs') + suffix;
}

function parse(originalDoc) {
  var currentTag,
      doc = _.clone(originalDoc, true);

  initDoc(doc);

  doc.content.split(NEW_LINE).forEach(function(line){
    var match = line.match(JSDOC_TAG);
    if (match) { // we found a new tag!
      // in case we are in the middle of parsing a previous tag we flush it now
      if ( currentTag ) {
        processTag(currentTag, doc, line);
      }
      // start a new tag
      currentTag = {
        name: match[1],
        text: match[3] ? [match[3]] : []
      };
    } else if (currentTag) { // we didn't find a new tag but are in still parsing a previous one
      // add this line to the current tag
      currentTag.text.push(line);
    }
  });

  // we got to the end of the file so flush any outstanding tag
  processTag(currentTag, doc, line);

  updateMetaData(doc);
}

module.exports = parse;