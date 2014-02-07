# Migration Notes

This document contains things that need to be done to migrate the current docs to Dgeni.

* All ` ``` ` tagged code should have the language added (e.g.) ` ```html ` or ` ```js `
* All `<pre>` tagged code should be converted to ``` back-ticked markdown
* api docs' `@name` tags should be stripped of all but their shortname
* `@module` tags need to be added only where the top level containing folder doesn't match the 
  module name.
* `{@link }` tags need to be recomputed based on their position - this will be helped by the processor
  catching missing links
* error docs' `@name` tags need changing from `@name $compile:ctreq` to `@name $compile.ctreq`
  `@name ([^:]+):(.+)` ->  `@name $1.$2`
* tutorial docs need a @step tag adding and to have their @name tag modifying to remove the "Tutorial:"
  bit from the start: i.e. `@name Tutorial: 0 - Bootstrapping` -> `@name 0 - Bootstrapping`
* tutorial docType changes from `overview` to `tutorial`