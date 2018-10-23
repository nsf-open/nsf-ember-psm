import Service from '@ember/service';

import { inject as service } from '@ember/service';
import { hashSettled } from 'rsvp';

export default Service.extend({
  api: service('api'),

  getPersonnel({
    propID,
    revID
  }) {
    return this.get('api').httpGet('apis.personnel.getPersonnel', propID, revID);
  },


  getLastUpdated({
    propID,
    revID
  }) {
    return this.get('api').httpGet('apis.personnel.getLastUpdated', propID, revID);
  },

  getPersonnelInfo({
    propID,
    revID
  }) {
    return hashSettled({
      personnel: this.getPersonnel({propID, revID}),
      lastUpdated: this.getLastUpdated({propID, revID})
    });
  }
});
