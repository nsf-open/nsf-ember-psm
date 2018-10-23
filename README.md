# Trunk

This README outlines the details of collaborating on the PSM Ember application.
Proposal Submission Modernization (PSM) is a multi-year initiative to modernize proposal submission at NSF.
Note: the Open Source version of this project will not run as required urls and configurations have been removed, this should be considered for reference only.

## Prerequisites

You will need the following things properly installed on your computer.

* [SVN](https://subversion.apache.org/)
* [Node.js](http://nodejs.org/) (with NPM)
* [Bower](http://bower.io/)
* [Ember CLI](http://www.ember-cli.com/)
* [PhantomJS](http://phantomjs.org/)

## Installation

* `svn checkout <repository-url>` this repository
* change into the new directory
* `npm install`
* `bower install`

## Running / Development

* `ember server` or `ember s`
* Visit the PSM landing page at [http://localhost:4200/#/proposal-prep](http://localhost:4200/#/proposal-prep).

### Code Generators

Make use of the many generators for code, try `ember help generate` for more details

### Running Tests

* visit http://localhost:4200/tests to view the test results live reloading in the browser
* `npm test` will run all Ember unit tests in the console
* `npm run coverage` will run all Ember unit tests in the console AND produce a coverage report at trunk/coverage/index.html
  * This coverage report will likely be used by Sonar to report on Ember test coverage

### Building

* `ember build` (development)
* `ember build --environment production` (production)

### Deploying

Deployment is done via Jenkins. Auto deployment occurs on DEV and manual deployment on INTG and ACPT.

## Further Reading / Useful Links

* [ember.js](http://emberjs.com/)
* [ember-cli](http://www.ember-cli.com/)
* Development Browser Extensions
  * [ember inspector for chrome](https://chrome.google.com/webstore/detail/ember-inspector/bmdblncegkenkacieihfhpjfppoconhi)
  * [ember inspector for firefox](https://addons.mozilla.org/en-US/firefox/addon/ember-inspector/)

