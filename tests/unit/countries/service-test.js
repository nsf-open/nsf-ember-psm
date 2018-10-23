import { moduleFor, test } from 'ember-qunit';

moduleFor('service:countries', 'Unit | Service | countries', {
  // Specify the other units that are required for this test.
  needs: ['service:properties', 'service:lookups', 'service:api']
});

// Replace this with your real tests.
test('it exists', function(assert) {
  const service = this.subject();
  assert.ok(service);
});
