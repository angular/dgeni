angular-doc-gen
===============

The documentation generation utility for angular.js


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
inline tags.

### Doc Processing

The collection of tags contains simple information extracted from the tag itself.
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

