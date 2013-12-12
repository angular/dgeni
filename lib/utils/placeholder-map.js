/**
 * This module provides a place to store text that will be replaced back into the docs later
 * @type {Object}
 */
module.exports = {
  /**
   * Add a new block of text to the map
   * @param {string} text The text to store
   * @returns {string} An identifier to retrieve this text block later
   */
  add: function(doc, text) {
    var id = 'REPLACEME' + (doc.$placeholders.$seq++);
    doc.$placeholders[id] = text;
    return id;
  },
  /**
   * Initialize the map to start clear out any previous mappings
   */
  init: function(doc) {
    doc.$placeholders = { $seq: 0 };
  },
  /**
   * Get a block of text that was previously stored
   * @param  {string} id The identifier for this block
   * @return {string}    The retrieved block of text
   */
  get: function(doc, id) {
    return doc.$placeholders[id];
  }
};