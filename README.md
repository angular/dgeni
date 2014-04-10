# Dgeni - Documentation Generator [![Build Status](https://travis-ci.org/angular/dgeni.svg?branch=master)](https://travis-ci.org/angular/dgeni)

The node.js documentation generation utility by angular.js and other projects.

## Getting started

To get started, install the dependencies and then try out the example.

## Install Dependencies

You'll need node.js and a bunch of npm modules installed to run this tool.  Get node.js from here:
http://nodejs.org/.  Then, in the root folder of the project run:

```
npm install
```

This will install the npm modules needed for documentation generation.  If you want to run the
example you'll need to install more dependencies - see below.



## Architecture

The tool is modular.  There are three main phases of document generation:

* File Reading - reading docs from files.
* Doc Processing - parsing ngdocs and calculating meta data
* HTML Rendering - converting the parsed docs into HTML

Each of these phases will execute a set of plugins (extractors, processors and renderers) to
generate the documentation.

### Document Processors

In practice all these phases are executed by a pipeline of **document processors**. Each processor
can provide a list of other processors that it must come before or after, and it can provide zero or
more of the following handlers:

* `init(config, injectables) { ... }` - gives the processor and opportunity to initialize itself
based on the configuration object and also add items to the dependency injection container.
* `process(docs, ...) { ... }` - invoked by the dependency injector.  Each processor's process
handler is called an order that fits with the declared `runBefore` and `runAfter` dependencies.

The `before` and `after` handlers can be synchronous or asynchronous.  If they are synchronous then
they should return undefined or a new array of documents. If they are asynchronous then they must
return a promise, which will resolve to undefined or a new collection of documents.

#### Pseudo Marker Processors

There are a number of processors that don't do anything but act as markers for stages of the
processing.  You can use these markers in `runBefore` and `runAfter` properties to ensure that your
processor is run at the right time.  Here is the list of these marker processors in order:

* loading-files
* files-loaded
* parsing-tags
* tags-parsed
* extracting-tags
* tags-extracted
* processing-docs
* docs-processed
* adding-extra-docs
* extra-docs-added
* rendering-docs
* docs-rendered
* writing-files
* files-written


## Packages

Document processors, templates and other configuration can be bundled into a `package`.  Packages
can load up and extend other packages.  In this way you can build up your custom configuration on
top of an existing configuration.

There are some initial packages defined in the
[dgeni-packages repository](https://github.com/angular/dgeni-packages).


