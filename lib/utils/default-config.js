var _ = require('lodash');

var Config = {
  applyTo: function(propertyPath, fn) {

    // Parse the property path to access to property to update
    var parts = propertyPath.split('.');
    var property = parts.pop();
    var container = _.reduce(parts, function(obj, prop) { return obj[prop] || (obj[prop] = {}); }, this);

    return fn(container, property);
  },
  set: function(propertyPath, newValue) {
    this.applyTo(propertyPath, function (container, property) {
      container[property] = newValue;
    });
  },
  prepend: function(propertyPath, values) {
    this.applyTo(propertyPath, function (container, property) {
      container[property] = container[property] || [];
      values = _.isArray(values) ? values : [values];
      Array.prototype.unshift.apply(container[property], values);
    });
  },
  append: function(propertyPath, values) {
    this.applyTo(propertyPath, function (container, property) {
      container[property] = container[property] || [];
      values = _.isArray(values) ? values : [values];
      Array.prototype.push.apply(container[property], values);
    });
  },
  merge: function(propertyPath, extraProperties) {
    this.applyTo(propertyPath, function (container, property) {
      container[property] = container[property] || {};
      _.assign(container[property], extraProperties);
    });
  }
};

var config = _.create(Config, {

  source: {
    files : [],
    extractors: []
  },

  processing: {
    tagParser: null,
    processors: [],
    tagDefinitions: []
  },

  rendering: {
    templateFolders: [],
    patterns: [],
    filters: [],
    tags: []
  },

  logging: {
    level: 'info'
  }
});

module.exports = config;