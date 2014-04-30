# Dgeni - Documentation Generator [![Build Status](https://travis-ci.org/angular/dgeni.svg?branch=master)](https://travis-ci.org/angular/dgeni)

The node.js documentation generation utility by angular.js and other projects.

## Getting started

Try out the Dgeni example project at https://github.com/petebacondarwin/dgeni-example

## Installation

You'll need node.js and a bunch of npm modules installed to run this tool.  Get node.js from here:
http://nodejs.org/.  Then, in your project folder run:

```
npm install dgeni --save
```

This will install Dgeni and any modules that Dgeni depends upon.


## Architecture

The tool is modular. It is simply a collection of **document processors** that are run in a pipeline
on a set of documents.

### Document Processors

Processors provide information about where in the pipeline they should be run and a `process` method
which is called with the current set of documents.

```
process(docs) { ... do stuff with the docs ... }
```

The processors' `process` method is invoked via a dependency injection framework, which enables each
processor to have additional tools and data injected into it at runtime.


```
process(docs, examples, config) { ... use the examples and config too ... }
```

Processors can be synchronous or asynchronous:

* If they are synchronous then they should return
`undefined` or a new array of documents. If they return a new array of docs then this array will
replace the previous docs array.

* If they are asynchronous then they must return a promise, which will resolve to undefined or a new collection of documents. By returning a promise, the processor tells Dgeni that it is asynchronous
and Dgeni will wait for the promise to resolve before calling the next processor.

```
process(docs) {
  return qfs.readFile(...).then(function(response) {
    docs.push(response.data);
  });
}
```

The [dgeni-packages repository](https://github.com/angular/dgeni-packages) contains a number of processors - from basic essentials to complex,
angular.js specific.  These processors are collected together with configuration into folders,
which we called packages.

The dgeni-packages/base folder contains a package that is the basis for most Dgeni setups.  This
packages provides processors that define four main phases of document generation:

* File Reading - reading docs from files.
* Doc Processing - parsing ngdocs and calculating meta data
* HTML Rendering - converting the parsed docs into HTML
* File Writing - writing the rendered docs to files


#### Pseudo Marker Processors

There are a number of processors that don't do anything but act as markers for stages of the
processing.  You can use these markers in `runBefore` and `runAfter` properties to ensure that your
processor is run at the right time.  Here is the list of these marker processors in order:

* reading-files
* files-read
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


