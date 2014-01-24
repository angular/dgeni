angular-doc-gen
===============

The documentation generation utility for angular.js

## Getting started

To get started, install the dependencies and then try out the example.

## Install Dependencies

You'll need node.js and a bunch of npm modules installed to run this tool.  Get node.js from here:
http://nodejs.org/.  Then, in the root folder of the project run:

```
npm install
```

### Run the example

There is an example with templates and source code from which you can generate a bunch of partial
HTML files.

First, you'll need to install some local dependencies to be able to run the example:

```
cd example
npm install 
```

There is a configuration file called `ngdoc.config.js` that defines how the documents
should be generated. The configuration file defines where to find the source files containing the
ngdocs and also where to write the rendered HTML files.

Once you have run generated the example documentation, you should find that a folder called `build`
has been created containing rendered files.

### using CLI tool

There is  a command line program in the main tool called `bin/gen-docs.js`.

```
cd example
../bin/gen-docs.js ngdoc.config.js
```

### using Gulp (preferred method)

Even more cool, there is now a gulpfile for the example that basically does the same (and more) as
the CLI tool above.  It also provides the ability to copy over assets to the build folder and so on.

You'll need to have GulpJS installed

```
sudo install -g gulp
```

Then just run gulp

```
cd example
gulp
```


## Architecture

The tool is modular.  There are three main phases of document generation:

* File Reading - reading docs from files.
* Doc Processing - parsing ngdocs and calculating meta data
* HTML Rendering - converting the parsed docs into HTML

Each of these phases will execute a set of plugins (extractors, processors and renderers) to
generate the documentation.

### File Reading

We need to be able to read docs from various different file formats. The file reading phase runs
**extractors** to do this. Out of the box there are extractors to read from the following file
types:

* **ngdoc** - Read the whole file in as an ngdoc
* **JavaScript** - Strip ngdocs out of comments in JavaScript files. Can produce more than one doc per
  file

### Doc Processing

Once we have read in all the documents we process them. This is done by document **processors**.

Each processor is an object that may provide one or more of the following functions:

* `init: function(config) { ... }`: this function is called with the current configuration to allow
the plugin to initialize itself before any processing starts.
* `before: function(docs) { ... }`: this function is executed at the start of processing.  It is
passed the entire collection of documents and it should return the processed document collection, or
`undefined` if the original docs collection should be used.
* `each: function(doc) { ... }`: this function is executed for each document in the collection.  It
is passed the document that is being processed.
* `after: function(docs) { ... }`: this function is executed at the end of processing after all the
"each" functions have been called.  It is passed the entire collection of documents and it should
return the processed document collection, or `undefined` if the original docs collection should be
used.

#### AngularJS Processors

Here is some information about some of the processors that com

* **Doctrine Tag Parser** - 
Parse the tags in the document contents using the `doctrine` library, which creates an object
structure containing information about each tag that is found. It does not parse inline tags.
This processor attaches this object to the document in the `tags` property.

* **Document Filtering** -
For AngularJS we are only interested in documents that contain the @ngdoc tag.  This processor
removes docs that do not contain this tag.

* **Doctrine Tag Extractor** -
Extract meta-data from the tags into properties on the doc using a set of declarative tag
definitions.

* **Merge Child Docs**

All docs that have a `@memberof` tag are attached to their parent document and removed from the top
level list of docs.

* **Links**

Parse all `{@link ... }` inline tags in the docs and replace with real anchors.  This processor is
able to compute URLs for code references.

* **Examples**

Parse the `<example>` tags from the content, generating new docs that will be converted to extra
files that can be loaded by the application and used, for example, in live in-place demos of the
examples and e2e testing.

* **Index Pages**

Create new docs that will correspond to index pages based on the deployment information in the 
configuration.  In the angularjs project there are a number of configurations, including "debug",
"jquery", "no-cache" and "production".  Each configuration loads up different dependencies, such as
"angular.js" or "angular.min.js".

* **Module**

Some docs that represent a module.  The processor will compute the package name for the module (e.g.
angular or angular-sanitize).  It also collects up all documents that belong to the module and
attaches them to the module doc in the `components` property.

* **Paths**

This processor computes the URL to the document and the path to the final output file for the
document.

### HTML Rendering

We render each of these documents as an HTML page. We use the "nunjucks" JavaScript template
tool-kit to generate HTML based on the data in each document. We have nunjucks tags and filters that
can render links and text as markdown and will highlight code.

The template used to render the doc is computed by a `templateFinder`, which uses the first matche
from a set of patterns provided in the configuration. This allows a lot of control to provide
generic templates for most situations and specific templates for exceptional cases.

Here is an example of the angularjs patterns:

```
rendering: {

      ...

      templatePatterns: [
        '${ doc.template }',
        '${ doc.id }.${ doc.docType }.template.html',
        '${ doc.id }.template.html',
        '${ doc.docType }.template.html'
      ],

      ...

    },
```
