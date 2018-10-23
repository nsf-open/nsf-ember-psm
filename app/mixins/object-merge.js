import Mixin from '@ember/object/mixin';

/**
 * Provides the functionality to shallow merge, deep merge, and clone objects.
 * The original credits for this mixin go to:
 * * JavaScript/NodeJS Merge v1.2.0
 * * [yeikos](https://github.com/yeikos/js.merge)
 * * [Copyright 2014 yeikos - MIT license](https://raw.github.com/yeikos/js.merge/master/LICENSE)
 *
 * @namespace Mixins
 * @class ObjectMerge
 * @extends Ember.Mixin
 */
export default Mixin.create({

  /**
     * Shallow merge two or more JavaScript objects. Any top level nested objects will be replaced wholesale.
     *
     * @method mergeObjects
     *
     * @param {bool} [clone=false] A boolean indicating whether the result object should be a unique clone. If false, the first merge object will be modified.
     * @param {...Object} arguments Two or more Plain Old JavaScript Objects that will be progressively merged in the order they are provided.
     * @return {object}
     */
  mergeObjects(clone) {
    return this._mergeObjects(clone === true, false, arguments);
  },

  /**
     * Deep merge two or more objects recursively. The properties of nested objects will be considered.
     *
     * @method deepMergeObjects
     *
     * @param {bool} [clone=false] A boolean indicating whether the result object should be a unique clone. If false, the first merge object will be modified.
     * @param {...Object} arguments Two or more Plain Old JavaScript Objects that will be progressively merged in the order they are provided.
     * @return {object}
     */
  deepMergeObjects(clone) {
    return this._mergeObjects(clone === true, true, arguments);
  },

  /**
     * Clone the provided object, removing any references.
     *
     * @method cloneObject
     *
     * @param {Object} input The JavaScript object to be clone.
     * @return {Object}
     */
  cloneObject(input) {
    let output = input,
      index,
      size;
    const type = this._typeOf(input);

    if (type === 'array') {
      output = [];
      size = input.length;

      for (index = 0; index < size; index += 1) {
        output[index] = this.cloneObject(input[index]);
      }
    }
    else if (type === 'object') {
      output = {};
      for (index in input) {
        if ({}.hasOwnProperty.call(input, index)) {
          output[index] = this.cloneObject(input[index]);
        }
      }
    }

    return output;
  },

  /**
     * Get the object type of the provided input as a string.
     *
     * @method _typeOf
     * @private
     *
     * @param {Object} input The Javascript object to get the type of.
     * @return {string} The object type represented as a string: 'string', 'boolean', 'number', etc.
     *
     * @see http://jsperf.com/typeofvar
     */
  _typeOf(input) {
    return ({}).toString.call(input).slice(8, -1).toLowerCase();
  },

  /**
     * Supports deep merging two objects.
     *
     * @method _mergeObjectsRecursive
     * @private
     *
     * @param {Object} base The merge target.
     * @param {Object} extend The secondary object that will be merged into base.
     * @return {Object}
     */
  _mergeObjectsRecursive(base, extend) {
    if (this._typeOf(base) !== 'object') { return extend; }

    for (const key in extend) {
      if (this._typeOf(base[key]) === 'object' && this._typeOf(extend[key]) === 'object') {
        base[key] = this._mergeObjectsRecursive(base[key], extend[key]);
      }
      else {
        base[key] = extend[key];
      }
    }

    return base;
  },

  /**
     * Supports basic merging of two objects.
     *
     * @method _mergeObjects
     * @private
     *
     * @param {bool} clone Boolean value indicating whether the merged object should be a clone of the original arguments.
     * @param {bool} recursive Boolean value indicating whether the merge should be shallow (false) or deep (true).
     * @param {array} argv An array of JavaScript objects that will be merged in order.
     * @return {object}
     */
  _mergeObjects(clone, recursive, argv) {
    let result = argv[0];
    const size = argv.length;

    if (clone || this._typeOf(result) !== 'object') {
      result = {};
    }

    for (let index = 0; index < size; index += 1) {
      const item = argv[index],
        type = this._typeOf(item);

      if (type !== 'object') { continue; }

      for (const key in item) {
        if ({}.hasOwnProperty.call(item, key)) {
          const sitem = clone ? this.cloneObject(item[key]) : item[key];
          if (recursive) {
            result[key] = this._mergeObjectsRecursive(result[key], sitem);
          }
          else {
            result[key] = sitem;
          }
        }
      }
    }

    return result;
  }
});
