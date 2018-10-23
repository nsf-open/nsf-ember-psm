import Service from '@ember/service';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';

export default Service.extend({

  _loading: false,
  _loaded: false,
  _lookupInfo: null,

  api: service('api'),
  props: service('properties'),
  activeUser: service('active-user'),

  loading: computed('_loading', {
    get() {
      return this.get('_loading');
    }
  }).readOnly(),
  loaded: computed('_loaded', {
    get() {
      return this.get('_loaded');
    }
  }).readOnly(),

  lookupInfo: computed('_lookupInfo', {
    get() {
      return this.get('_lookupInfo');
    }
  }).readOnly(),

  load(lookupName) {
    if (!lookupName) {
      // console.error("lookupName must be passed into the lookups .load method");
      return false;
    }

    if (this.get('loaded') && this.get('loaded')[lookupName]) { return true; }

    if (this.get('loading') && this.get('loading')[lookupName]) { return false; }

    this.set((`_loading${lookupName}`), true);

	return this.getConstants(lookupName).then((response) => {      // set proposal section lookup
      if (!this.get('_lookupInfo')) { this.set('_lookupInfo', {}); }
      if (!this.get('_loaded')) { this.set('_loaded', {}); }
      if (!this.get('_loading')) { this.set('_loading', {}); }
      this.set(`_lookupInfo.${lookupName}`, response);
      this.set(`_loaded.${lookupName}`, true);
      this.set(`_loading.${lookupName}`, false);
    });
  },

  getConstants(constantName) {
    return this.get('api').httpGet(`apis.constants.${constantName}`);
  }


});
