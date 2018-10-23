/* eslint-disable no-var, vars-on-top */

var path = require('path');
var Funnel = require('broccoli-funnel');
var mergeTrees = require('broccoli-merge-trees');

module.exports = {
  name: 'datetime-picker',

  isDevelopingAddon() {
    return true;
  },

  included(target) {
    this._super.included.apply(this, target);

    var app = target.app || target;
    app.import('vendor/eonasdan-bootstrap-datetimepicker/build/css/bootstrap-datetimepicker.css');
    app.import('vendor/eonasdan-bootstrap-datetimepicker/src/js/bootstrap-datetimepicker.js');
  },


  treeForVendor(vendorTree) {
    var trees = [];
    var pickerPath = require.resolve('eonasdan-bootstrap-datetimepicker').replace(path.join('src', 'js', 'bootstrap-datetimepicker.js'), '');

    if (vendorTree) {
      trees.push(vendorTree);
    }

    try {
      var bootstrap = require.resolve('bootstrap').replace(path.join('js', 'npm.js'), '');
      trees.push(new Funnel(bootstrap, {destDir: 'bootstrap'}));
    }
    catch (err) {
      // Nothing to do.
    }

    trees.push(new Funnel(pickerPath, {destDir: 'eonasdan-bootstrap-datetimepicker'}));

    return mergeTrees(trees);
  }
};
