module.exports = {
  name: 'json',
  process: function(obj) {
    return JSON.stringify(obj, null, '  ');
  }
};