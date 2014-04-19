/**
 * A Dgeni configuration object
 */
export class Config {

  /**
   * @param {Object} initialProperties An optional object of initial properties to assign to the
   *                                   config object
   */
  constructor(initialProperties = {}) {
    Object.assign(this, initialProperties);
  }

  /**
   * Ensure that the give path to the specified property on the object exists and then apply
   * the given function to this property.
   * @private
   * @param  {String}   propertyPath The path to the property on the object to work with
   * @param  {Function} fn           The function to apply to the property
   * @return {*}                     The result of applying `fn` to the `property`
   */
  applyTo(propertyPath, fn) {
    // Parse the property path to access to property to update
    var parts = propertyPath.split('.');
    var property = parts.pop();
    var container = parts.reduce((obj, prop) => { return obj[prop] || (obj[prop] = {}); }, this);

    return fn(container, property);
  };

  /**
   * Set a property on the config object
   * @param {String} propertyPath The path to the property to set
   * @param {*} newValue          The new value to set on this property
   */
  set(propertyPath, newValue) {
    this.applyTo(propertyPath, (container, property) => {
      container[property] = newValue;
    });
  };

  /**
   * Get a property on the config object
   * @param  {String} propertyPath The path to the property to get
   * @param  {*} defaultVal        The value to return if this property does not exist
   * @return {*}                   The value of the property or `defaultVal` if the property does not exist
   */
  get(propertyPath, defaultVal) {
    var parts = propertyPath.split('.');
    var property = this;
    if ( parts.every((prop) => { property = property[prop]; return property; }) ) {
      return property;
    }
    return defaultVal;
  };

  /**
   * Prepend one or more values to a collection on the config object. If there is no collection defined
   * then a new one is created. If the `values` is an array then each item in the array is prepended to the
   * collection.  Otherwise `values` itself is prepended to the collection.
   * @param  {String} propertyPath The path to the property to update
   * @param  {*|Array} values      The value(s) to prepend to the collection
   */
  prepend(propertyPath, values) {
    this.applyTo(propertyPath, (container, property) => {
      container[property] = container[property] || [];
      container[property].unshift(...values);
    });
  };

  /**
   * Append one or more values to a collection on the config object. If there is no collection defined
   * then a new one is created. If the `values` is an array then each item in the array is appended to the
   * collection.  Otherwise `values` itself is appended to the collection.
   * @param  {String} propertyPath The path to the property to update
   * @param  {*|Array} values      The value(s) to prepend to the collection
   */
  append(propertyPath, values) {
    this.applyTo(propertyPath, (container, property) => {
      container[property] = container[property] || [];
      container[property].push(...values);
    });
  };

  /**
   * Merge an object into the object found at the `propertyPath` in the config object.  Properties
   * in the `extraProperties` object override those found in the object at the properyPath.
   * If no object exists at the `propertyPath` then it will be initialized to an empty object before
   * merging in the `extraProperties`
   * @param  {String} propertyPath The path to the property to update
   * @param  {Object} extraProperties The object to merge into the object found at `propertyPath`
   */
  merge(propertyPath, extraProperties) {
    this.applyTo(propertyPath, (container, property) => {
      container[property] = container[property] || {};
      Object.assign(container[property], extraProperties);
    });
  }
}