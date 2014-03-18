var _ = require('lodash');
var log = require('dgeni').log;

/**
 * Recurse down the code AST node that is associated with this doc for a name
 * @param  {[type]} node [description]
 * @return {[type]}      [description]
 */
function findCodeName(node) {
  var match;
  switch(node.type) {
    case 'FunctionDeclaration':
      return node.id && node.id.name;
    case 'ExpressionStatement':
      return findCodeName(node.expression);
    case 'AssignmentExpression':
      return findCodeName(node.right) || findCodeName(node.left);
    case 'FunctionExpression':
      return node.id && node.id.name;
    case 'MemberExpression':
      return findCodeName(node.property);
    case 'Identifier':
      return node.name;
    case 'ReturnStatement':
      return findCodeName(node.argument);
    case 'Property':
      return findCodeName(node.value) || findCodeName(node.key);
    case 'ObjectExpression':
      return null;
    case 'Program':
      return null;
    default:
      log.warn('HELP!');
      log.warn(node);
  }
}

module.exports = {
  name: 'name-from-code',
  runAfter: ['processing-docs'],
  runBefore: ['docs-processed'],
  process: function(docs) {
    _.forEach(docs, function(doc) {
      doc.name = doc.name || findCodeName(doc.code.node);
    });
    return docs;
  }
};