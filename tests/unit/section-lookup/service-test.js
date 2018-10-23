import { moduleFor, test } from 'ember-qunit';
import Service from '@ember/service';

const proposalServiceStub = Service.extend({
  init(...args) {
    this._super(...args);
  }
});

moduleFor('service:section-lookup', 'Unit | Service | section lookup', {
  // Specify the other units that are required for this test.
  needs: ['service:properties', 'service:active-user'],

  beforeEach() {
    this.register('service:proposal', proposalServiceStub);
    this.inject.service('proposal', { as: 'proposalService' });
  }
});

// Replace this with your real tests.
test('it exists', function(assert) {
  const service = this.subject();
  assert.ok(service);
});
