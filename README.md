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

### Run the Example

There is an example with templates and source code from which you can generate a bunch of partial
HTML files.  It has a command line program called `gen-docs.js` and a configuration file called
`ngdoc.conf.js`:

```
cd example
node gen-docs.js ngdoc.conf.js
```

The configuration file defines where to find the source files containing the ngdocs and also where
to write the rendered HTML files.

You should find that a folder called `build` has been created containing rendered files.


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

### ngdoc Parsing

Once we have a document read in from a file we parse it (using doctrine) to extract the ngdoc tags.
The doctrine library creates an object structure for each tag that is found. It does not parse
inline tags. We then extract what meta-data about the document we want from these tags using a set
of declarative tag definitions.

### Doc Processing

We need to do more work with this to get the full meta data required for rendering. This is done
by the doc-processor plugins.

Each plugin can provide the following functions:

* before: this function is executed at the start of processing.  It is passed the entire collection
of documents and it should return the processed document collection.
* each: this function is executed for each document in the collection.  It is passed the document
that is being processed.
* after: this function is executed at the end of processing after all the "each" functions have been
called.  It is passed the entire collection of documents and it should return the processed document
collection.


### HTML Rendering

We render each of these documents as an HTML page. We use the nunjucks JavaScript template
tool-kit to generate HTML based on the data in each document. We create a filter that can render
text as markdown and will highlight code.


