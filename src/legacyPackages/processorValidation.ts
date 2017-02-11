const Q = require('q');
const validate = require('validate.js');
import {Package} from '../Package';

export const processorValidationPackage = new Package('processorValidation')

.config(function(dgeni) {
  dgeni.stopOnValidationError = true;
})

.eventHandler('generationStart', function validateProcessors(log, dgeni) {
  return function validateProcessorsImpl() {
    const validationErrors = [];

    let validationPromise = Q();

    // Apply the validations on each processor
    dgeni.processors.forEach(function(processor) {
      validationPromise = validationPromise.then(function() {
        return validate.async(processor, processor.$validate).catch(function(errors) {
          validationErrors.push({
            processor: processor.name,
            package: processor.$package,
            errors: errors
          });
          log.error('Invalid property in "' + processor.name + '" (in "' + processor.$package + '" package)');
          log.error(errors);
        });
      });
    });

    validationPromise = validationPromise.then(function() {
      if ( validationErrors.length > 0 && dgeni.stopOnValidationError ) {
        return Q.reject(validationErrors);
      }
    });

    return validationPromise;
  };
});
