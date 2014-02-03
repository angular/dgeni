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


## Run the example

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

*(Note that you have to run `npm install` twice, once in the root of the repository and once in
the `example` folder as it has its own npm dependencies, separate from the main tool.)*

The structure of the example folder looks like this:

```
- example
  - app                - the skeleton web application for the example
    - src              - the javascript source files that will be built into the web application
    - assets           - static assets that will be used by the web app
  - content            - ngdoc files containing content for the docs
  - src                - JavaScript source files that contain ngdocs in code comments 
  - ngdoc.config.js    - the doc gen configuration
  - gulpfile.js        - the GulpJS build file
  - package.json       - contains the node.js dependencies for the example
  - bower.json         - contains the bower depdendences for the example's web app
```

The documentation generation is controlled via the configuration file `example.config.js`.  This
defines where the source files are, how they should be processed, what files should be generated
and where to put the generated files.  Most of the configuration is actually inside the
`docs.angularjs.org` package, which is found in the `../packages` folder.  See the section on
packages below.

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
../bin/gen-docs.js example.config.js
```


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

## Packages

Document processors, templates and other configuration can be bundled into a `package`.  Packages
can load up and extend other packages.  In this way you can build up your custom configuration on
top of an existing configuration.

Out of the box there are the following packages:

* `jsdoc` - a standard set of processors that can extract jsdoc documents and render them as HTML.
* `angularjs` - *(depends upon the `jsdoc` package)* an extra set of processors and templates that
are specific to angularjs projects.
* `docs.angularjs.org` - *(depends upon the `angularjs` package)* an futher set of processors and
templates that are specific to building the documentation that is hosted at docss.angularjs.org.


#### `jsdoc` Package

This package contains the following processors:

* `doc-extractor` - used to load up documents from files.  This processor can be configured to use a
set of **extractors**.  The `jsdoc` package has a single `js` extractor, which can extract documents
from jsdoc style comments in files.
* `doctrine-tag-parser` - uses the Doctrine library to parse the jsdoc tags in the extracted documents.
* `doctrine-tag-extractor` - extracts the tags information and converts it to specific properties on
the documents, based on a set of tag-definitions.  The `jsdoc` package contains definitions for the
following tags: `name`, `memberof`, `param`, `property`, `returns`, `module`, `description`, `usage`,
`animations`, `constructor`, `class`, `classdesc`, `global`, `namespace` and `kind`.
* `nunjucks-renderer` - uses the Nunjucks template library to render the documents into files, such
as HTML or JS, based on templates.

This package does not provide any templates.

### `angularjs` Package

There is one new document extractor in this package, `ngdoc`, which can pull a single document from
an ngdoc content file.

On top of the processors provided by the `jsdoc` package, this packages adds the following processors:

* `filter-ngdocs` -
For AngularJS we are only interested in documents that contain the @ngdoc tag.  This processor
removes docs that do not contain this tag.

* `memberof` -
All docs that have a `@memberof` tag are attached to their parent document and removed from the top
level list of docs.

* `links` -
Parse all `{@link ... }` inline tags in the docs and replace with real anchors.  This processor is
able to compute URLs for code references.

* `examples` -
Parse the `<example>` tags from the content, generating new docs that will be converted to extra
files that can be loaded by the application and used, for example, in live in-place demos of the
examples and e2e testing.

* `module` -
Some docs that represent a module.  The processor will compute the package name for the module (e.g.
angular or angular-sanitize).  It also collects up all documents that belong to the module and
attaches them to the module doc in the `components` property.

* `paths` -
This processor computes the URL to the document and the path to the final output file for the
document.

* `service-provider-mapping` - relates documents about angular services to their corresponding
angular service provider document.

This package also provides a set of templates for generating an HTML file for each document: api,
directive, error, filter function, input, module, object, overview, provider, service, type and a
number to support rendering of the runnable examples.

### doc.angularjs.org Package

This package adds the following processors on top of those provided by the `angularjs` package.

* `index-pages` -
Create new docs that will correspond to index pages based on the deployment information in the 
configuration.  In the angularjs project there are a number of configurations, including "debug",
"jquery", "no-cache" and "production".  Each configuration loads up different dependencies, such as
"angular.js" or "angular.min.js".

* `keywords` - extracts the keywords from the document for use in searching.

* `pages-data` - creates a new document, which will be rendered as a JS file, containing information
about all the pages in the web app, used for setting up the navigation.

* `version-data` - creates a new document, which will be rendered as a JS file, containing information
about the versions of angular, used for the version-changer drop-down in the web app.

The package contains an extra tag definition that extracts the step number from tutorial documents,
which enable more control over sorting of those pages.

The package adds a number of extra templates, primarily to support the extra processors: index,
pages-data, versions-data and tutorial.

## HTML Rendering

We render each of these documents as an HTML page. We use the "nunjucks" JavaScript template
tool-kit to generate HTML based on the data in each document. We have nunjucks tags and filters that
can render links and text as markdown and will highlight code.

The template used to render the doc is computed by a `templateFinder`, which uses the first match
from a set of patterns in a set of folders, provided in the configuration. This allows a lot of control to provide
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

      templateFolders: [
        'templates'
      ]

    },
```
