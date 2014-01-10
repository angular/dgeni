module.exports = {
  name: 'firstLine',
  process: function(str) {
    if (!str) return str;
    
    str = str
      .split("\n")[0]
      .replace(/<.+?\/?>/g, '')
      .replace(/{/g,'&#123;')
      .replace(/}/g,'&#125;');
    return str;
  }
};