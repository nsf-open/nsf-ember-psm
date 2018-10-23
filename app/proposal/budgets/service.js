
import Service from '@ember/service';
import { inject as service } from '@ember/service';

export default Service.extend({
  api: service('api'),

  getBudget({propId, revId, sectionCode, instId}) {
    return this.get('api').httpGet('apis.budgets.budgetGet', propId, revId, sectionCode, instId);
  },

  saveBudget(budgetData) {
    return this.get('api').httpPost({
      path: 'apis.budgets.budgetSave',
      data: budgetData,
    });
  },

  validateBudget(budgetData) {
    return this.get('api').httpPost({
      path: 'apis.budgets.budgetValidate',
      data: budgetData,
    });
  }
});
