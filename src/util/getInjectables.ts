/**
 * @dgService getInjectables
 * @kind function
 * @description
 * Use the injector to get a collection of service instances from a collection of injectable factories
 */
export function getInjectablesFactory(injector) {
  return function(factories) {
    return factories.map(function(factory) {
      const instance = injector.invoke(factory);
      if (!instance.name) {
        instance.name = factory.name;
      }
      return instance;
    });
  };
};
