angular-doc-gen
===============

The documentation generation utility for angular.js

### Getting started

To get started, install the dependencies and then try out the example.

### Install Depencencies

You'll need node.js and a bunch of npm modules installed to run this tool.  Get node.js from here:
http://nodejs.org/.  Then, in the root folder of the project run:

```
npm install
```

### Run the Example (via CLI tool)

There is an example with templates and source code from which you can generate a bunch of partial
HTML files.  It has a command line program called `gen-docs.js` and a configuration file called
`ngdoc.conf.js`:

```
cd example
../bin/gen-docs.js ngdoc.conf.js
```

The configuration file defines where to find the source files containing the ngdocs and also where
to write the rendered HTML files.

You should find that a folder called `build` has been created containing rendered files.

### Run the example (with Gulp!)

Even more cool, there is now a gulpfile for the example that basically does the same as the above
but in a more comprehensive manner, such as the ability to copy over assets to the build more
easily.

You'll need to have GulpJS installed

```
sudo install -g gulp
```

```
cd example
gulp
```


## Architecture

The tool is modular.  There are three primary phases document generation:

* File Reading - reading docs from files.
* Doc Processing - parsing ngdocs and calculating meta data
* HTML Rendering - converting the parsed docs into HTML

### File Reading

We need to be able to read docs from various different file formats.  Out of the box we can read
from the following file types:

* ngdoc - Read the whole file in as an ngdoc
* JavaScript - Strip ngdocs out of comments in JavaScript files. Can produce more than one doc per
  file

### Doc Processing

Once we have read in all the documents we process them. This is done by the doc-processor plugins.

Each plugin can provide the following functions:

* init: this function is called with the current configuration to allow the plugin to initialize
itself before any processing starts.
* before: this function is executed at the start of processing.  It is passed the entire collection
of documents and it should return the processed document collection.
* each: this function is executed for each document in the collection.  It is passed the document
that is being processed.
* after: this function is executed at the end of processing after all the "each" functions have been
called.  It is passed the entire collection of documents and it should return the processed document
collection.

#### AngularJS Processors

Here is some information about some of the processors that com

* **Doctrine Tag Parser** - 
We parse the tags in a document using doctrine) to extract an object containing the bare tags.
The doctrine library creates an object structure for each tag that is found. It does not parse
inline tags.

* **Document Filtering** -
For AngularJS we are only interested in documents that contain the @ngdoc tag.

* **Doctrine Tag Extractor** -
We extract what meta-data about the document we want from these tags using a set of declarative tag
definitions.

* **Merge Child Docs**

* **Links**

* **Examples**


### HTML Rendering

We render each of these documents as an HTML page. We use the "nunjucks" JavaScript template
tool-kit to generate HTML based on the data in each document. We have nunjucks tags and filters that
can render links and text as markdown and will highlight code.

The templates used to render the doc is based upon the docunent's id and docType.