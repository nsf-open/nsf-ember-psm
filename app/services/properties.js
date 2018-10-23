import Service from '@ember/service';
import { computed } from '@ember/object';
import { allSettled } from 'rsvp';
import { isNone } from '@ember/utils';
import { isArray } from '@ember/array';
import {request as ajax} from 'ic-ajax';
import Utils from 'psm/mixins/common-utility';
import Merge from 'psm/mixins/object-merge';
import ENV from 'psm/config/environment';

/**
 * The PropertiesService class handles property file loading, and the replacement of placeholders within property values with real-time data when needed.
 * Its initialization, performed via the `load()` method, should occur as early on in the application startup as possible. Since `load()` returns a basic
 * Promise object, it can take part in driving the loading and error sub-states of the site startup.
 *
 * Calling `load()` on PropertiesService will result in two JSON files being loaded, both from the `/public/properties` directory. The first, `default.json`
 * is always loaded and is where the default version of properties, or any properties that do not change based on current environment, should be defined.
 * The second JSON file to be loaded will share its name with the current environment: `<environment-name>.json`. If you want to define an environment specific
 * property then you will do so in one of these files. When loaded, the environment file will be merged over top of the default file, so any object defined
 * in both will be set to the the environment specific value.
 *
 * ```
 * // The easiest way to access PropertiesService is by using Ember's dependency injection.
 * props: Ember.inject.service('properties')
 * ```
 *
 * @namespace Services
 * @class PropertiesService
 * @extends Ember.Service
 * @uses Mixins.CommonUtility
 * @uses Mixins.ObjectMerge
 */
export default Service.extend(Utils, Merge, {

  TAG: 'Properties Service',

  /**
     * Internal property backing the 'loading' computed property.
     *
     * @private
     * @property _loading
     * @type Boolean
     */
  _loading: false,

  /**
     * Internal property backing the 'loading' computed property.
     *
     * @private
     * @property _loaded
     * @type Boolean
     */
  _loaded: false,

  /**
     * Internal property backing the 'loadedProperties' computed property.
     *
     * @private
     * @property _loadedProperties
     * @type String[]
     */
    init(...args) {
      this._super(args);
      this._loadedProperties = []
    },

  /**
     * Boolean value indicating whether or not the service is in the process of loading properties.
     *
     * @property loading
     * @type Boolean
     * @readOnly
     */
  loading: computed('_loading', {
    get() {
      return this.get('_loading');
    }
  }).readOnly(),

  /**
     * Boolean value indicating whether or not the service has finished loading properties.
     *
     * @property loaded
     * @type Boolean
     * @readOnly
     */
  loaded: computed('_loaded', {
    get() {
      return this.get('_loaded');
    }
  }).readOnly(),

  /**
     * A String Array containing the top level property names created by loading remote properties content into this service.
     *
     * @property loadedProperties
     * @type String[]
     * @readOnly
     */
  loadedProperties: computed('_loadedProperties', {
    get() {
      return this.get('_loadedProperties');
    }
  }).readOnly(),

  /**
     * Makes two AJAX requests in succession: first for the primary properties JSON file, and then the environment specific override file.
     *
     * @method load
     * @return {Boolean|Promise}
     */
  load() {
    if (this.get('loaded')) { return true; }

    this.set('_loading', true);

    const self = this,
      env = this.getEnvironmentName();

    const pinkySwear = [
      ajax({type: 'GET', url: `${ENV.urlSuffix}/properties/default.json`, contentType: 'application/json', cache: false}),
      ajax({type: 'GET', url: `${ENV.urlSuffix}/properties/${env}.json`, contentType: 'application/json', cache: false})
      // ajax({type: 'GET', url: '/toggle-service/v1/api/toggles/', contentType: 'application/json'})
    ];

    return allSettled(pinkySwear, 'Service: Properties').then(
      function(results) {
        let fulfilled = [],
          togglesService = null,
          i = 0;

        // Strip out any failed requests.
        for (i; i < results.length; i += 1) {
          if (results[i].state == 'fulfilled') {
            fulfilled.push(results[i].value);
          }
        }
        // Make sure all the responses are valid JSON.
        fulfilled = fulfilled.map(self._toJSON);
        // If we have a response from the togglz service, store it separately. We need to merge the environment files first
        // and determine if we want to use the service's overrides (toggle-ception!).
        if (fulfilled.length == 3) {
          togglesService = fulfilled[2];
        }

        // Merge environment properties
        fulfilled = self.deepMergeObjects(fulfilled[0], fulfilled[1]);

        // If truthy, we can toss the togglz service overrides back in.
        try {
          if (fulfilled.toggles.features.togglesService && togglesService) {
            fulfilled = self.deepMergeObjects(fulfilled, togglesService);
          }
        }
        catch (error) {
          // Nothing needs to be handled here. We just needed to swallow the exception that will arise if the 'toggles.features.togglesService' object chain doesn't exist.
        }

        self.set('_loadedProperties', self._getTopLevelKeys(fulfilled));

        self.beginPropertyChanges();
        self.setProperties(fulfilled);
        self.setProperties({'_loading': false, '_loaded': true});
        self.endPropertyChanges();

        return true;
      }
    );
  },

  /**
     * Returns this service to its base state (before any remote properties content was loaded). After this, the load() method
     * may be called again.
     *
     * @method reset
     *
     * @return {Boolean}
     */
  reset() {
    if (!this.get('loaded')) { return true; }

    const props = this.get('loadedProperties');

    for (let i = 0; i < props.length; i += 1) {
      this.set(props[i], undefined);
    }

    this.setProperties({'_loaded': false, '_loadedProperties': []});

    return true;
  },

  /**
     * Similar to the `get()` method, but this takes a second optional argument that will be used to replace any placeholder
     * values in the retrived property, if that property is a string. Any non-string properties will be returned unaltered.
     * The placeholder syntax is identical to that found in ES6 string templates: `${...}`, with the elipsis being any string
     * key to identify that placeholder. For example:
     *
     * `var myProperty = "/posts/${post_id}/comments/${comment_id}";`
     *
     * **Note:** while this uses ES6 syntax, do not use back ticks to actually identify it as a string template. We do not want
     * JavaScript to try to parse it.
     *
     * @method getReplace
     *
     * @param {String} keyValue The property name to retrieve. This argument adheres to the same rules as a property name that you
     * you pass to `get()` on any typical Ember Object.
     *
     * @param {String|Number|Boolean|Array|Object} [replaceValues] The replaceValues argument should contain the values that the
     * placeholders in the retrieved property string will be replaced with. It may be a null, string, number, boolean, array of
     * strings, or an Ember Object. See the examples below for how each of these types is treated.
     *
     * @return {String|Object} If the property named by `keyValue` is a non-string then it will be returned unaltered. If it is a string
     * then it will be returned after its placeholders have been replaced by the contents of the replaceValues argument.
     *
     * @example
     *      // Assume that the property 'post.comment.link' equals '/posts/${post_id}/comments/${comment_id}'
     *
     *      // The unaltered property.
     *      properties.getReplace('post.comment.link', null); // => '/posts/${post_id}/comments/${comment_id}'
     *
     *      // If you only have a single placeholder to replace, you can pass the replacement value directly.
     *      properties.getReplace('post.comment.link', '10'); // => '/posts/10/comments/${comment_id}'
     *      properties.getReplace('post.comment.link', 10);   // => '/posts/10/comments/${comment_id}'
     *      properties.getReplace('post.comment.link', true); // => '/posts/true/comments/${comment_id}'
     *
     *      // The contents of Arrays will be used in order. The first placeholder is replaced by [0], the second by [1],
     *      // and so on until either the end of the array is reached, or there are no more placeholders.
     *      properties.getReplace('post.comment.link', ['10', '37']) // => '/posts/10/comments/37'
     *
     *      // Ember Objects may be used to target specific placeholders. The placeholder name will be matched to an
     *      // object's property of the same name.
     *      var postComment = Ember.Object.extend({
     *        post_id: '10',
     *        comment_id: '37'
     *      }).create();
     *
     *      properties.getReplace('post.comment.link', postComment) // => '/posts/10/comments/37'
     */
  getReplace(keyValue, replaceValues) {
    const string = this.get(keyValue);
    if (typeof string != 'string' || isNone(replaceValues)) {
      return string;
    }

    const regex = new RegExp(/\${(.+?)}/g);

    let result = string,
      thenBreak = false,
      match;

    // Loops through a string, stopping for each ${...} placeholder capture.
    while ((match = regex.exec(string)) !== null) {
      let found = null;

      // Strings, numbers, and booleans.
      if (['string', 'number', 'boolean'].indexOf(typeof replaceValues) > -1) {
        found = replaceValues.toString();
        thenBreak = true;
      }
      // Arrays.
      else if (isArray(replaceValues) && replaceValues.length) {
        found = replaceValues.shift().toString();
        thenBreak = replaceValues.length == 0;
      }
      // Everything else is assumed to be some sort of Ember Object.
      else {
        found = replaceValues.get(match[1]);
      }

      // If a replacement was found, swap it and the placeholder.
      if (found) {
        result = result.replace(match[0], found);
        if (thenBreak) {
          break;
        }
      }
    }
    return result;
  },

  /**
     * Sends a String argument through JSON.parse, other arguments will be returned unaltered.
     *
     * @private
     * @method _toJSON
     *
     * @param {String|Object} input The object to have parsed.
     * @return {Object} A JSON object, or the unaltered input.
     */
  _toJSON(input) {
    if (typeof input == 'string') {
      input = JSON.parse(input);
    }

    return input;
  },

  /**
     * Retrieves the top level property names of an Object.
     *
     * @private
     * @method _getTopLevelKeys
     *
     * @param {Object} input The object to inspect.
     * @return {String[]} An array of property names.
     */
  _getTopLevelKeys(input) {
    const keys = [];
    let key;
    for (key in input) {
      if ({}.hasOwnProperty.call(input, key)) {
        keys.push(key);
      }
    }
    return keys;
  }
});
