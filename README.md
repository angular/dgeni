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

### ngdoc Parsing

The ngdoc parser itself is modular.  Each tag (and inline tag) is defined independently and you can
add custom tags easily.  Further, you can provide plug-ins that do additional parsing before and
after processing of each docs tags.  The following tags are supported out of the box:

* eventType - adds eventType and eventTarget properties to the doc
* param - adds param info to a collection of params on the doc
* property - adds property info to a collection of properties on the doc
* requires - adds requires info to a collection of requires on the doc
* returns - adds a returns information object to the doc
* *default* - this is the catch-all, which simply applies the value of the tag to the corresponding
  property on the doc (e.g. `@module ng` -> `doc.module = 'ng'`)

There is only one built-in in-line tag.

* link (*in-line*) - add a new link to the doc.links property and replace the tag with an anchor

The built-in plug-ins compute the value of the following meta properties:

* section - the section is the top level path segment in the navigation.
* path - the path to the final rendered file
* id - a string that uniquely identifies a doc - if the doc is describing a code component then this
  corresponds to the unique code reference name (e.g. module:ngRoute.directive:ngView).
