import { moduleFor, test } from 'ember-qunit';
import Service from '@ember/service';

const budgetValidateResponse = {};

const apiStub = Service.extend({
  httpPost(parameter) {
    let apiStubResponse;
    if (parameter.path === 'apis.budgets.budgetValidate') {
      apiStubResponse = budgetValidateResponse;
    }

    return Promise.resolve(apiStubResponse);
  }
});

moduleFor('service:proposal/budgets', 'Unit | Service | proposal/budgets', {
  // Specify the other units that are required for this test.
  // needs: ['service:foo']
  beforeEach() {
    this.register('service:api', apiStub);
    this.inject.service('api', { as: 'api' });
  }
});

// Replace this with your real tests.
test('verifies validateBudget() method works correctly', function(assert) {
  const service = this.subject();

  const promise = service.validateBudget({});
  promise.then((budgetValidateData) => {
    assert.equal(budgetValidateData, budgetValidateResponse);
  })
});
