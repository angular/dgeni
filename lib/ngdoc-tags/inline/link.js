function calculateUrl(doc, urlOrName) {
  return urlOrName;
}


/**
 * convert {@link} directives to real HTML anchors
 */
module.exports = function(doc, tag, otherStuff) {

  if ( tag === 'link' ) {
    var match = /(\S+)\s*(.*)/.exec(otherStuff);
    var urlOrName = match[1];
    var title = match[2];
    var url = calculateUrl(urlOrName);

    doc.links = doc.links || [];
    doc.links.push(url);

    title = (title || url).replace(/^#/g, '').replace(/\n/g, ' ');

    return '<a href="' + url + '">' + title + '</a>';
  }
};