module.exports = function checkProperty(obj, property) {
  if ( !obj.hasOwnProperty(property) ) {
    throw new Error('Required property "'+property+'" missing! Are you missing a plugin?');
  }
};