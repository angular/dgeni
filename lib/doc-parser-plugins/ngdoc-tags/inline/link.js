/**
 * convert {@link} directives to real HTML anchors
 */
module.exports = function(doc, tagName, otherStuff) {

  if ( tagName === 'link' ) {
    var match = /(\S+)\s*(.*)/.exec(otherStuff);
    var url = match[1];
    var title = match[2];

    // The url is a code reference only if it does not contain a slash
    if ( url.indexOf('/') === -1 ) {
      var name, type, module;
      match = /(module:([^.]+)$)|(module:([^.]+)\.)?((directive|filter|global):)?(\S+)/.exec(url);
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

      title = '<code>' + (title || name) + '</code>';
      url = '/' + segments.join('/');
    } else {
      title = title || url;
    }

    doc.links = doc.links || [];
    doc.links.push(url);

    title.replace(/^#/g, '').replace(/\n/g, ' ');

    return '<a href="' + url + '">' + title + '</a>';
  }
};