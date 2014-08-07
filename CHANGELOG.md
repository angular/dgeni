# ChangeLog

## v0.4.0-beta.2 (7th August 2014)

Minor bug fixes

* fix(Dgeni): require Package not package    fc2be818
* fix(Dgeni): do not modify `package.dependencies` property    61449389


## v0.4.0-beta.1 (25th July 2014)

This is a major re-architecting of how Dgeni uses Dependency Injection and configuration.

This version of Dgeni is compatible with dgeni-packages@^0.10.0

* Dgeni is now configured by **Packages**, which can depend on other **Packages**.
* **Packages** contain **Services**, **Processors** and **Config Blocks**, which are all
instantiated or invoked by the DI system.
* **Processors** themselves are special instances of DI **Service** rather than the
**process()** being invoked by the DI system.
* Dgeni specific properties on **Processors** are now prefixed with a `$`. E.g. `$process()`,
`$runBefore`, `$runAfter`.
* **Processors** can now be "validated" using [validatejs.org](validatejs.org) constraints,
specified in the `processor.$validate` property.
* **Processors** can now be disabled by setting `processor.$enabled = false`.
* **Processors** with the same name will override previously registered **Processors**, say
from a Package dependency.
* New injectable helper services have been provided: `dgeni`, `log`, `getInjectables`.
* Use injectable `log` service in your Processors and Services instead of requiring `winston`.
* Test coverage of the source files is now at 100%.

The most significant commits are listed below:

* fix(Dgeni): allow config blocks to change $enabled on a Processor   d231c244
* feat(Dgeni): allow processors to be disabled by setting `$enabled: false`      d390fcd3
* feat(Dgeni): allow config blocks to make changes to processor order      604fcbfb
* feat(Dgeni): add package info to processors to help with error reporting       81184052
* fix(Dgeni): processors with the same name should override previous ones      ff7ec049
* feat(getInjectables): add new shared service       6d9cef0a
* test(mock/log): add simple mock log service for testing      51a8dc92
* feat(Package): allow processors and service to override their name       a9584fd2
* test(Dgeni): add tests to improve code coverage      7b4a757b
* feat(Package): allow processors to be defined as an object       a75e9181
* feat(Dgeni): add new (no config - DI based) Dgeni      e8d30958
* feat(Package): add Package type      87cbf122
* feat(log): add wrapper around winston      c303a9a6
* refact(*): remove previous Dgeni implementation      1cf67e2d

## v0.3.0 (11th April 2014)

This is a "Spring Clean" release

* Configuration, utilities and dependencies that were only used by separate Dgeni packages have
  been moved to those repositories.
* There is an initial set of "guide" documents to read at
  https://github.com/angular/dgeni/tree/master/docs/en_GB/guide.
* The API has been cleaned up to make it easier to use Dgeni without having to look inside.

**New Stuff**

* feat(doc-processor): processors can declare injectable exports  cfd19f08

**Breaking Changes**

* refactor(index): provide a cleaner API surface  3c78776d
* refact(doc-processor): move pseudo processors to dgeni-packages  c198f651


## v0.2.2 (6th March 2014)

**Bug fixes**

* fix(doc-processor): pass docs to next processor following a failure  67997e8e


## v0.2.1 (5th March 2014)

**Bug fixes**

* fix(doc-processor): handle errors thrown in processors better

## v0.2.0 (28th February 2014)

**New Features**

* extractTagFactory (lib/extract-tags.js) is moved to the dgeni-packages project.

**BREAKING CHANGE**

* The extractTagsFactory is now moved to the dgeni-packages
project, because it is specific to the way that tags are parsed and extracted
in that project.  If you rely on this then you should add dgeni-packages
as a dependency to your project.

## v0.1.1 (24th February 2014)

**Bug fixes**

* allow defaultFn to return falsy values [3b2e098dc92b](https://github.com/angular/dgeni/commit/3b2e098dc92b7f9766aaf03f2d7815c6fb4862e3)

## v0.1.0 (20th February 2014)

* Initial version to support AngularJS documentation generation.
