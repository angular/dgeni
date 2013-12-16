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

### Doc Processing

Once we have a document read in from a file we process it with document processor plugins. We have
the following plugins:

* ngdoc parser - parse the ngdoc tags
* doc merger - merge child documents (e.g. docs that refer to methods or events on other objects)
  into their parent documents
* link checker - check that links refer to docs that exist in the docs that have been found

### HTML Rendering

Now we render each of these documents as an HTML page. We use the nunjucks JavaScript template
tool-kit to generate HTML based on the data in each document. We create a filter that can render
text as markdown and will highlight code.