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

    if ( url.indexOf('/') === -1 ) {
      //       1       2 MOD 2  1 34                4 3 5NAME5
      match = /(module:([^.]+)\.)?((directive|filter):)?(\S+)/.exec(url);
      var module = match[2] || doc.module;
      var type = match[4] || (doc.ngdoc === 'directive' || doc.ngdoc === 'filter' ? doc.ngdoc : undefined);
      var name = match[5] || doc.name;

      var segments = [];
      module && segments.push(module);
      type && segments.push(type);
      name && segments.push(name);

      title = title || name;
      url = segments.join('/');
    } else {
      title = title || url;
    }

    doc.links = doc.links || [];
    doc.links.push(url);

    title.replace(/^#/g, '').replace(/\n/g, ' ');

    return '<a href="' + url + '">' + title + '</a>';
  }
};