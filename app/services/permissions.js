import Service from '@ember/service';
import { computed } from '@ember/object';
import ArrayProxy from '@ember/array/proxy';
import { A } from '@ember/array';
import { isArray } from '@ember/array';

/**
 * The PermissionsService provides for the easy checking of permissions and roles in the application. Given a permissions and/or roles list -
 * an array of strings in which each string represents a single permission or role - the service may then be queried regarding whether or not
 * a permission/role is present. More simply put, this is just a fancy way of asking "does string X exist in array Y".
 *
 * @namespace Services
 * @class PermissionsService
 *
 * @example
 * // Lets assume that the following is within an Ember controller
 * permissions: service('permissions'),
 *
 * init() {
 *  this.get('permissions').addPermissions('post.create', 'post.edit');
 *  this.super(...arguments);
 * },
 *
 * canCreate: computed(function(){
 *  return this.get('permissions').hasPermission('post.create'); // Returns true
 * }),
 *
 * canDelete: computed(function(){
 *  return this.get('permissions').hasPermission('post.delete'); // Returns false
 * })
 */
export default Service.extend({

  /**
   * An array containing all of the valid permission strings.
   *
   * @property permissions
   * @type array
   * @default []
   * @readOnly
   */
  permissions: computed(function () {
    return ArrayProxy.create({content: A([])});
  }).readOnly(),

  /**
   * An array containing roles within the proposal that the user is in
   *
   * @property roles
   * @type array
   * @default []
   * @readOnly
   */
  roles: computed(function () {
    return ArrayProxy.create({content: A([])});
  }).readOnly(),

  /**
   * An array containing all roles this user has for all institutions
   *
   * @property institutionRoles
   * @type array
   * @default []
   * @readOnly
   */
  institutionRoles: computed(function () {
    return ArrayProxy.create({content: A([])});
  }).readOnly(),

  /**
   * Add one or more permission strings to the permissions array. This method will accept the following arguments:
   * * A single string
   * * N number of strings
   * * An array of strings
   *
   * @method addPermissions
   *
   * @example
   * addPermissions('post.create');                // Adds the permission 'post.create'
   * addPermissions('post.create', 'post.edit');   // Adds the permissions 'post.create', and 'post.edit'
   * addPermissions(['post.create', 'post.edit']); // Adds the permissions 'post.create', and 'post.edit'
   */
  addPermissions() {
    this._insertIntoEnumerable(this.get('permissions'), this._coerceToArray(arguments));
  },

  resetPermissions() {
    this.get('permissions').clear();
    this._insertIntoEnumerable(this.get('permissions'), this._coerceToArray(arguments));
  },

  /**
   * Removes one or more permission strings to the permissions array. This method will accept the following arguments:
   * * A single string
   * * N number of strings
   * * An array of strings
   *
   * @method removePermissions
   *
   * @example
   * removePermissions('post.create');                // Removes the permission 'post.create'
   * removePermissions('post.create', 'post.edit');   // Removes the permissions 'post.create', and 'post.edit'
   * removePermissions(['post.create', 'post.edit']); // Removes the permissions 'post.create', and 'post.edit'
   */
  removePermissions() {
    this._removeFromEnumerable(this.get('permissions'), this._coerceToArray(arguments));
  },


  /**
   * Add one or more role strings to the roles array. This method will accept the following arguments:
   * * A single string
   * * N number of strings
   * * An array of strings
   *
   * @method addRoles
   *
   * @example
   * addRoles('post.admin');                   // Adds the role 'post.admin'
   * addRoles('post.admin', 'post.creator');   // Adds the roles 'post.admin', and 'post.creator'
   * addRoles(['post.admin', 'post.creator']); // Adds the roles 'post.admin', and 'post.creator'
   */
  addRoles() {
    this._insertIntoEnumerable(this.get('roles'), this._coerceToArray(arguments));
  },
  addInstitutionRoles() {
    this._insertIntoEnumerable(this.get('institutionRoles'), this._coerceToArray(arguments));
  },
  // clear roles array then reset with passed in roles
  setRoles() {
    this.get('roles').clear();
    this._insertIntoEnumerable(this.get('roles'), this._coerceToArray(arguments));
  },


  /**
   * Removes one or more role strings to the roles array. This method will accept the following arguments:
   * * A single string
   * * N number of strings
   * * An array of strings
   *
   * @method addRoles
   *
   * @example
   * removeRoles('post.admin');                   // Removes the role 'post.admin'
   * removeRoles('post.admin', 'post.creator');   // Removes the roles 'post.admin', and 'post.creator'
   * removeRoles(['post.admin', 'post.creator']); // Removes the roles 'post.admin', and 'post.creator'
   */
  removeRoles() {
    this._removeFromEnumerable(this.get('roles'), this._coerceToArray(arguments));
  },


  /**
   * Checks whether any of the supplied arguments are contained in the permissions array. This method will accept
   * the following arguments:
   * * A single string
   * * N number of strings
   * * An array of strings
   *
   * @method hasPermission
   *
   * @example
   * // Assume that the permission strings 'post.create' and 'post.edit' have been added to the permissions array.
   *
   * hasPermission('post.create')                 // Returns true
   * hasPermission(['post.create', post.delete])  // Returns true
   * hasPermission('post.create', 'post.delete')  // Returns true
   * hasPermission('post.delete', 'post.admin')   // Returns false
   */
  hasPermission() {
    const checkFor = this._coerceToArray(arguments);
    return this._containsAny(checkFor, 'permissions');
  },


  /**
   * Checks whether any of the supplied arguments are contained in the roles array. This method will accept
   * the following arguments:
   * * A single string
   * * N number of strings
   * * An array of strings
   *
   * @method hasRole
   *
   * @example
   * // Assume that the role strings 'post.creator' and 'post.admin' have been added to the permissions array.
   *
   * hasRole('post.creator')                // Returns true
   * hasRole(['post.admin', post.reviewer]) // Returns true
   * hasRole('post.admin', 'post.reviewer') // Returns true
   * hasRole('post.reviewer')               // Returns false
   */
  hasRole() {
    const checkFor = this._coerceToArray(arguments);
    return this._containsAny(checkFor, 'roles');
  },
  hasInstitutionRole() {
    const checkFor = this._coerceToArray(arguments);
    return this._containsAny(checkFor, 'institutionRoles');
  },

  /**
   * This utility function will always return an array. The rules are:
   * * If the provided argument is an array, and the first element of that array is an array, then that element is returned.
   * * If the provided argument is an array, the the first element of that array is not an array, then the argument is returned.
   * * If the provided argument is not an array, then the argument is added to a new array and returned.
   *
   * @method _coerceToArray
   *
   */
  _coerceToArray(obj) {
    let result = null;

    if (isArray(obj)) {
      if (obj.length === 1) {
        if (isArray(obj[0])) {
          result = obj[0];
        }
        else {
          result = obj;
        }
      }
      else {
        result = obj;
      }
    }
    else {
      result = [obj];
    }

    return result;
  },


  /**
   *
   * @param enumerable
   * @param items
   * @private
   */
  _insertIntoEnumerable(enumerable, items) {
    for (let i = 0; i < items.length; i += 1) {
      enumerable.addObject(items[i]);
    }
  },


  /**
   *
   * @param enumberable
   * @param items
   * @private
   */
  _removeFromEnumerable(enumberable, items) {
    for (let i = 0; i < items.length; i += 1) {
      enumberable.removeObject(items[i]);
    }
  },


  /**
   * A quick check to see if two arrays have any intersection.
   * PSM Update: we will check the .permissionCode property (permissions) or .abbreviation property (roles)
   *
   * @method _containsAny
   *
   * @param checkFor {array}
   * @param within {array}
   *
   * @returns {boolean} True if one or more equal values exist within both array arguments, false otherwise.
   *
   * @private
   */
  _containsAny(checkFor, within) {
    const searchWithin = within;
    within = this.get(within).content;
    // for (let i = 0; i < checkFor.length; i += 1) {
    //   if (within.includes(checkFor[i])) {
    //     return true;
    //   }
    // }
    if (searchWithin === 'roles' || searchWithin === 'institutionRoles') {
      for (let i = 0; i < within.length; i += 1) {
        if (checkFor[0].toString().includes(within[i].abbreviation)) {
          return true;
        }
      }
    }
    else {
      for (let i = 0; i < within.length; i += 1) {
        if (checkFor[0].toString().includes(within[i].permissionCode)) {
          return true;
        }
      }
    }


    return false;
  },
});
