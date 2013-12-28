module.exports = function checkProperty(obj, property) {
  if ( !obj[property] ) {
    throw new Error('Required property "'+metaName+'" missing! Are you missing a plugin?');
  }
};