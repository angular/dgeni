# What is Dgeni?

Dgeni is a documentation generator built by the AngularJS Team, that is very flexible because it has
a modular core and it is extensible with plugins. The goal of Dgeni is to have a tool, that makes it
very easy for developers to document their code and extend it to their needs.

The AngularJS project for example, uses a specific kind of annotation when it comes to documenting
the code. These specific annotations are not officially supported by typical documentation generators
like JSDoc. Therefore, the AngularJS Team built their own documentation generator that sits on top
of JSDoc and ships with additional syntactic sugar (NGDoc) to annotate AngularJS code.

However, it turned out that the NGDoc generator implementation was hard to maintain and change,
because things like templates weren't separated from the actual code base. Also adding new features
wasn't easy for new contributors. In addition, the entire generator was built into the AngularJS code
base which doesn't work with the *Separation Of Concerns* paradigm.

Dgeni can be used for client, as well as server side documentation. So it's also suitable for Node.js
components or REST API documentation.

It's also possible to build custom packages to extend Dgeni's functionality, which let's you create
very framework-specific documentation.
