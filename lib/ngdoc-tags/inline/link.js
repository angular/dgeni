function calculateUrl(doc, urlOrName) {
  
  if ( urlOrName.indexOf('/') ) {
    return urlOrName;
  }

  //           1       2 MOD 2  1 34                4 3 5 NAME 56 7FRAG 76
  var match = /(module:([^.]+)\.)?((directive|filter):)?([^#:]+)(#([\S]+))?/.exec(urlOrName);
  var module = match[2] || doc.module;
  var type = match[4] || (doc.ngdoc === 'directive' || doc.ngdoc === 'filter' && doc.ngdoc);
  var name = match[5] || doc.name;
  var fragment = match[7];

  return urlOrName;
}


/**
 * convert {@link} directives to real HTML anchors
 */
module.exports = function(doc, tagName, otherStuff) {

  if ( tagName === 'link' ) {
    var match = /(\S+)\s*(.*)/.exec(otherStuff);
    var url = match[1];
    var title = match[2];

    // The url is a code reference only if it does not start with a slash or a hash
    if ( url.search(/[\/#]/) === -1 ) {
      var name, type, module;
      match = /(global:([\S]+))|(module:([^.]+)\.)?((directive|filter):)?(\S+)/.exec(url);
      if( match[1] ) {
        // We have a global.
        name = match[2];
      } else {
        // We have something that is in a module
        module = match[4];
        type = match[6];
        name = match[7];

        if ( !module ) {
          // No module was specified so extract it from the current doc
          module = doc.module;
          if ( !type && doc.ngdoc === 'directive' || doc.ngdoc === 'filter' ) {
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