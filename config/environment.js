/* jshint node: true */

module.exports = function(environment) {
  var ENV = {
    modulePrefix: 'psm',
    contentSecurityPolicy: {
      'style-src': "'self' 'unsafe-inline'",
      'script-src': "'self' 'unsafe-eval' 'unsafe-inline'",
      'connect-src': "'self' http://localhost:80"
    },
    environment: environment,
    rootURL: '/proposalprep/',
    urlSuffix: '/proposalprep',
    // baseURL: '/',
    locationType: 'hash',
    EmberENV: {
      EXTEND_PROTOTYPES: {
        Date: false,
        Array: true
      },
      FEATURES: {
        // Here you can enable experimental features on an ember canary build
        // e.g. 'with-controller': true
      }
    },

    APP: {
      // Here you can pass flags/options to your application instance
      // when it is created
    },

    DateTimeFormats: {
      // Date and time formats as they are received from the server. These may be arrays if more than one format is expected.
      deserialize: {
        date: 'YYYY-MM-DD',
        time: 'HH:mm:ss.SSS',
        dateTime: 'YYYY-MM-DD HH:mm:ss.SSS',
		    unix: 'x'
      },

      // Date and time formats as they are send to the server.
      serialize: {
        date     : 'YYYY-MM-DD',
        time     : 'HH:mm:ss.SSSZ',
        dateTime : 'YYYY-MM-DD[T]HH:mm:ss.SSSZ'
      },

      // Date and time formats as they are rendered on screen.
      display: {
        date     : 'MM/DD/YYYY',
        time     : 'h:mm A',
        dateTime : 'MM/DD/YYYY h:mm A'
      }
    }

  };

  ENV['ember-oauth-iam'] = {
    clientId: '', // Removed
    domain: '' // Removed
  };

  ENV['ember-semantic-content-data'] = {
    host: '' // Removed
  };

  if (environment === 'development') {
    // ENV.APP.LOG_RESOLVER = true;
    ENV.APP.LOG_ACTIVE_GENERATION = true;
    ENV.APP.LOG_TRANSITIONS = true;
    ENV.APP.LOG_TRANSITIONS_INTERNAL = true;
    ENV.APP.LOG_VIEW_LOOKUPS = true;

  }

  if (environment === 'test') {
    // Testem prefers this...
    ENV.rootURL = '/';
    ENV.rootURL = '/proposalprep/';
    ENV.urlSuffix = '/proposalprep';
    // ENV.baseURL = '/';
    ENV.locationType = 'none';

    // keep test console output quieter
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;

    ENV.APP.rootElement = '#ember-testing';
  }

  if (environment === 'production') {

  }

  return ENV;
};
