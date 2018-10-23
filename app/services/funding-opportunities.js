import Service from '@ember/service';
import { inject as service } from '@ember/service';

export default Service.extend({
  api: service('api'),

  getFundingOpportunities() {
    return this.get('api').httpGet('apis.wizard.fundingOps').then((data) => {
      return data.fundingOpportunities;
    });
  }


});
