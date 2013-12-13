module.exports = {
  prepareTypeHintClassName : function(type) {
    var typeClass = type.toLowerCase().match(/^[-\w]+/) || [];
    return 'label type-hint type-hint-' + (typeClass[0] || 'object');
  },
  prepareClassName: function(text) {
    return text.toLowerCase().replace(/[_\W]+/g, '-');
  }
};