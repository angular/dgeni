# Roadmap

## dgeni

The bare documentation generator tool.

### Releases
* 0.3.1 - Bug fixes
* 0.4.0 - no-config (should we push on and get di.js into this release?)
* 0.5.0 - di.js (es6?) - this is up for discussion

### Additional Work
* Write guides for dgeni
* Generate API documentation for dgeni the tool

## dgeni-packages

The main store of dgeni packages containing all the processors and services that actually give
dgeni its document processing super-powers.

### Releases
* 0.9.4 - bug fixes
* 0.10.0 - no-config (to match the dgeni 0.4.0 release)
* 0.11.0 - better jsdoc processing, coffeescript & es6 support, better guide-style docs
* 0.12.0 - di.js?

### Additional Work
* Write API docs for each package and processor/service therein
* Generate API documentation for each package

## dgeni-example

A very simple example of how to get dgeni up and running.

## Releases
* 0.1.0 - tag a release for the current state of dgeni
* 0.2.0 - no-config (to match the dgeni 0.4.0 release)
* 0.3.0 - ...

## dgeni-docs

A new project, which doesn't yet exist.  It will be a documentation container website app.
The idea is that you can generate partials and metadata using dgeni and upload it to an instance of
this web app. The web app will host the documentation that you have uploaded providing navigation,
searching and display of the hosted docs.

* It should be easily themeable/skinnable using templates and stylesheets.
* It should be able to host multiple versions of a project
* It should allow linking between components in different projects/versions

## angular.js docs

The angular.js docs website and the original consumer of dgeni.  We need to keep this updated with
the latest changes to dgeni.  Moving forward AngularJS V2 consists of multiple interdependent projects,
written in ES6, which will all need a website (see dgeni-docs) to display their documentation.
