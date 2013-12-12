/**
 * Converts relative urls (without section) into absolute
 * Absolute url means url with section
 *
 * @example
 * - if the link is inside any api doc:
 * angular.widget -> api/angular.widget
 *
 * - if the link is inside any guid doc:
 * intro -> guide/intro
 *
 * @param {string} url Absolute or relative url
 * @returns {string} Absolute url
 */
module.exports = function convertUrlToAbsolute(url) {
  var hashIdx = url.indexOf('#');

  // Lowercase hash parts of the links,
  // so that we can keep correct API names even when the urls are lowercased.
  if (hashIdx !== -1) {
    url = url.substr(0, hashIdx) + url.substr(hashIdx).toLowerCase();
  }

  if (url.substr(-1) == '/') return url + 'index';
  //if (url.match(/\//)) return url;
  return this.section + '/' + url;
};