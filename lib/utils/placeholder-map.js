/**
 * This module provides a place to store text that will be replaced back into the docs later
 * @type {Object}
 */
function PlaceHolderMap() {
  this.seq = 0;
  this.map = {};
}

PlaceHolderMap.prototype = {
  /**
   * Add a new block of text to the map
   * @param {string} text The text to store
   * @returns {string} An identifier to retrieve this text block later
   */
  add: function(text) {
    var id = 'REPLACEME' + (this.seq++);
    this.map[id] = text;
    return id;
  },

  /**
   * Get a block of text that was previously stored
   * @param  {string} id The identifier for this block
   * @return {string}    The retrieved block of text
   */
  get: function(id) {
    return this.map[id];
  }
};

module.exports = PlaceHolderMap;