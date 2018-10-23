import { moduleFor, test } from 'ember-qunit';
import Service from '@ember/service';

const fundingOppServiceStub = Service.extend({
  init(...args) {
    this._super(...args);
  }
});

moduleFor('route:wizard', 'Unit | Route | wizard', {
  needs: ['service:properties', 'service:permissions', 'service:active-user', 'service:webtrend-analytics', 'service:messages'],

  beforeEach() {
    this.register('service:funding-opportunities', fundingOppServiceStub);
    this.inject.service('funding-opportunities', { as: 'fundingOpportunitiesService' });
  }
});

test('it exists', function(assert) {
  const route = this.subject();
  assert.ok(route);
});
