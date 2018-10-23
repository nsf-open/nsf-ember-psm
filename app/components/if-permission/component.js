import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';

/**
 * The IfPermission component is a tagless component that functions in similar fashion to Ember's built-in {{if}} component.
 * It will query the PermissionsService on your behalf, and is used to selectively render UI based on the permissions set.
 *
 * @namespace Components
 * @class IfPermissionComponent
 *
 * @example
 * {{if-permission 'post.create' 'post.edit'}}
 *  <p>This will be rendered if one or more of the positionally supplied arguments exist in the PermissionsService permissions array.</p>
 * {{else}}
 *  <p>This will be rendered if none of the positionally supplied arguments exist in the PermissionsService permissions array.</p>
 * {/if-permission}}
 */
const ifPermissionComponent = Component.extend({
  isComponentFactory: true,

  tagName: '',

  permissions: service('permissions'),

  isAuthorized: computed('params.[]', 'permissions.permissions.[]', function() {
    return this.get('permissions').hasPermission(this.get('params'));
  }).readOnly()
});

ifPermissionComponent.reopenClass({
  positionalParams: 'params'
});

export default ifPermissionComponent;
