// {
//   "framework": "qunit",
//   "test_page": "tests/index.html?hidepassed",
//   "disable_watching": true,
//   "launch_in_ci": [
//     "PhantomJS"
//   ],
//   "launch_in_dev": [
//     "PhantomJS",
//     "Chrome"
//   ]
// }

const Reporter = require('./tests/taptime-reporter.js');

module.exports = {
  framework: 'qunit',

  test_page: 'tests/index.html?hidepassed',

  disable_watching: true,

  phantomjs_debug_port: 9000,

  parallel: 8,

  launchers: {
    AltPhantom: {
      exe: 'phantomjs',
      args: ['tests/phantom-runner.js'],
      protocol: 'browser',
    },
  },

  launch_in_ci: [
    'AltPhantom'
  ],

  launch_in_dev: [
    'AltPhantom',
    'Chrome'
  ],

  reporter: new Reporter()
};
