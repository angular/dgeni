# ChangeLog

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
