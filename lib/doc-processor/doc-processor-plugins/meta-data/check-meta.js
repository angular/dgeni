module.exports = function checkMeta(doc, metaName) {
  if ( !doc[metaName] ) {
    throw new Error('Meta data missing! The document needs "'+metaName+'". Are you missing a plugin?');
  }
};