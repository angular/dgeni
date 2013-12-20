
function getLinkInfo(doc, codeName, title) {

  // The codeName is a code reference only if it does not contain a slash
  if ( codeName.indexOf('/') !== -1 ) {
    return {
      url: codeName,
      title: title || codeName,
      type: 'url'
    };
  }

  // We have a reference to a code component
  var name, type, module;
  var match = /(module:([^.]+)$)|(module:([^.]+)\.)?((directive|filter|global):)?(\S+)/.exec(codeName);
  if (match[1]) {
    // We have a module overview
    name = match[2];
  } else {
    // We have a component
    module = match[4];
    type = match[6];
    name = match[7];

    if ( !module ) {
      // No module was specified so extract it from the current doc
      module = doc.module;
      if ( !type && doc.ngdoc === 'directive' || doc.ngdoc === 'filter' || doc.ngdoc === 'global' ) {
        // No module or type was specified and the current doc is either a directive or a filter
        type = doc.ngdoc;
      }
    }
  }

  var segments = [doc.section];
  if(module) { segments.push(module); }
  if(type) { segments.push(type); }
  if(name) { segments.push(name); }

  return {
    url: '/' + segments.join('/'),
    title: title || name,
    type: 'code'
  };
}

module.exports = {
  getLinkInfo: getLinkInfo
};