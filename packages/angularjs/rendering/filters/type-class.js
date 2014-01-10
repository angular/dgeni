module.exports = {
  name: 'typeClass',
  process: function(str) {
    var typeClass = str.toLowerCase().match(/^[-\w]+/) || [];
    typeClass = typeClass[0] ? typeClass[0] : 'object';
    return 'label type-hint type-hint-' + typeClass;
  }
};