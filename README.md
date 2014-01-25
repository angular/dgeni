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

This will install the npm modules needed for documentation generation.  If you want to run the
example you'll need to install more dependencies - see below.


### Run the example

The best way to see how to setup and use this tool is to follow an example.  There is a fully
featured example with templates and source code from which you can generate a version of the
angularjs docs in the `/example` folder.

```
cd example
```

First, you'll need to install some local dependencies to be able to run the example:

```
npm install 
```

(Note that you have to run this from the `example` folder as it has its own npm dependencies,
separate from the main doc gen tool.)

The initial folder structure for the example looks like this:

```
- example
  - ngdoc.config.js  - the doc gen configuration 
  - src              - JavaScript source files that contain ngdocs in code comments 
  - content          - ngdoc files containing content for the docs
  - assets           - static assets that will be used by the web app
  - templates        - templates for the doc generator, specific to this example
  - processors       - plugins for the doc generator, specific to this example
```

The documentation generation is controlled via the configuration file `ngdoc.config.js`.  This
defines where the source files are, how they should be processed, what files should be generated
and where to put the generated files.

Once you have run the tool you will have a new folder called `build` containing rendered doc web
application.

### Using Gulp (preferred method)

There is a `gulpfile.js' for the example that has tasks to run the documentation generation, but
will also install bower dependencies, copy over the static assets to the build folder and and also
can start a web server to host the web app.

You'll need to have GulpJS installed:

```
sudo install -g gulp
```

Then just run the default Gulp task:

```
cd example
gulp
```

The complete list of Gulp tasks available are:

* default - runs the assets and doc-gen tasks
* clean - removes the build folder
* bower - installs bower dependencies
* assets - copies over the static assets to the build folder (depends on the bower and clean tasks)
* doc-gen - generates the docs into the build folder (depends on the clean task)
* watch - watches the files in the project and runs the default task when any change
* server - starts a web server at http://localhost:8000 for testing the web app


### using CLI tool

The documentation generation tool contains a command line (CLI) program called `gen-docs.js`. It is 
located in the `bin` folder of the repos.  This can also be used to generate the files for the
doc web app, but it will not copy static files into the build folder that are needed to actually
run the web app successfully.

```
cd example
../bin/gen-docs.js ngdoc.config.js
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
