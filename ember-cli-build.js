/* jshint node:true */
/* global require, module */
const EmberApp = require('ember-cli/lib/broccoli/ember-app');

module.exports = function(defaults) {
  const app = new EmberApp(defaults, {
    // Add options here
    sassOptions: {
      includePaths: [
        'node_modules/bootstrap-sass/assets/stylesheets'
      ],
      extension: 'scss'
    },
    'ember-webtrend-analytics': {
      config: {
        dcsid: '', // Removed
        domain: '' // Removed
      }
    }
  });

  /* Scripts */
  //app.import('node_modules/jquery/dist/jquery.min.js'); // removing this seems to solve all our problems - TB
  app.import('node_modules/bootstrap-sass/assets/javascripts/bootstrap.min.js');

  /* Font Awesome */
  app.import('node_modules/font-awesome/css/font-awesome.css');
  app.import('node_modules/font-awesome/fonts/fontawesome-webfont.eot', {
    destDir: 'fonts'
  });
  app.import('node_modules/font-awesome/fonts/fontawesome-webfont.svg', {
    destDir: 'fonts'
  });
  app.import('node_modules/font-awesome/fonts/fontawesome-webfont.ttf', {
    destDir: 'fonts'
  });
  app.import('node_modules/font-awesome/fonts/fontawesome-webfont.woff', {
    destDir: 'fonts'
  });
  app.import('node_modules/font-awesome/fonts/fontawesome-webfont.woff2', {
    destDir: 'fonts'
  });
  app.import('node_modules/font-awesome/fonts/FontAwesome.otf', {
    destDir: 'fonts'
  });

  app.import('node_modules/bootstrap-sass/assets/fonts/bootstrap/glyphicons-halflings-regular.eot', {
    destDir: 'fonts/bootstrap'
  });
  app.import('node_modules/bootstrap-sass/assets/fonts/bootstrap/glyphicons-halflings-regular.svg', {
    destDir: 'fonts/bootstrap'
  });
  app.import('node_modules/bootstrap-sass/assets/fonts/bootstrap/glyphicons-halflings-regular.ttf', {
    destDir: 'fonts/bootstrap'
  });
  app.import('node_modules/bootstrap-sass/assets/fonts/bootstrap/glyphicons-halflings-regular.woff', {
    destDir: 'fonts/bootstrap'
  });
  app.import('node_modules/bootstrap-sass/assets/fonts/bootstrap/glyphicons-halflings-regular.woff2', {
    destDir: 'fonts/bootstrap'
  });

  /* Momentjs for date formatting */
  app.import('node_modules/moment/min/moment.min.js');

  /* fileinput.min.js */
  app.import('vendor/fileinput.min.js');

  /* PSM String Polyfill */
  app.import('vendor/psm_string_polyfill.js');

  // Use `app.import` to add additional libraries to the generated
  // output files.
  //
  // If you need to use different assets in different
  // environments, specify an object as the first parameter. That
  // object's keys should be the environment name and the values
  // should be the asset to use in that environment.
  //
  // If the library that you are including contains AMD or ES6
  // modules that you would like to import into your application
  // please specify an object with the list of modules as keys
  // along with the exports of each module as its value.

  return app.toTree();
};
