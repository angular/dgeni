# Contributing to Dgeni
While dgeni is amazing we need help keeping it going and make it better that it already is. Here's how you can help!

- [Getting Started](#getting-started)
- [Making Changes](#making-changes)
- [Coding Conventions](#coding-conventions)
- [Submission Guidelines](#submission-guidelines)
- [Additional Resources](#additional-resources)

## <a name="getting-started">Getting Started</a>

1. Fork the repository
2. Create a topic branch off `master`
2. Run the tests
	1. `npm install`
	2. `npm test`
3. Good to go! Head over to the [Roadmap](roadmap) to see who's working on what. Or submit a feature request.

## <a name="making-changes">Making Changes</a>

Changes are all well and good but having an excess of architects never ends well. 
All major changes should be discussed in a [GitHub Issue](issues) before any major work gets done. 
This will prevent code duplication, a clearer direction, and helpful suggestions!

## <a name="coding-conventions">Coding Conventions</a>

TBD?

## <a name="submission-guidelines">Submission Guidelines</a>

1. Check to see if a similar ([feat](https://github.com/angular/dgeni/search?q=feat&type=Issues)/[fix](https://github.com/angular/dgeni/search?q=fix&type=Issues)/[docs](https://github.com/angular/dgeni/search?q=docs&type=Issues)/[style](https://github.com/angular/dgeni/search?q=style&type=Issues)/[refactor](https://github.com/angular/dgeni/search?q=refactor&type=Issues)/[perf](https://github.com/angular/dgeni/search?q=perf&type=Issues)/[test](https://github.com/angular/dgeni/search?q=test&type=Issues)/[chore](https://github.com/angular/dgeni/search?q=chore&type=Issues)) already exists
2. If one doesn't exist then you can create one with the following format
3. Else if one does exist check out the [Roadmap](roadmap) to see if someone is working on it

`
[TITLE:]<type>(<scope>): <subject>
[DESCRIPTION:]<description> <sample code|client code>*
`

Where <sample code|client code> is for any code context for the specific type.

Example of a bug

`
bug(docs-processed): docs not processed

After the docs are "processed" the next processor receives the docs as undefined.
`

# <a name="additional-resources">Additional Resources</a>

* [General GitHub documentation](http://help.github.com/)
* [GitHub pull request documentation](http://help.github.com/send-pull-requests/)
* [Angular.js Contributing Doc](https://github.com/angular/angular.js/blob/CONTRIBUTING.md)

[roadmap]: http://github.com/angular/dgeni/blob/master/ROADMAP.md
[issues]: https://github.com/angular/dgeni/issues?state=open