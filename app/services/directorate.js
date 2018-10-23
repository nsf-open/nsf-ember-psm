import Service from '@ember/service';
import { inject as service } from '@ember/service';

export default Service.extend({
  api: service('api'),

  getDirectorates({ fundingOppId }) {
    return this.get('api').httpGet('apis.wizard.directorates', fundingOppId);
  },

  getDivisions({ fundingOppId, directorateCode }) {
    return this.get('api').httpGet('apis.wizard.divisions', fundingOppId, directorateCode);
  }
});
