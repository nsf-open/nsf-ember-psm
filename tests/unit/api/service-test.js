import { moduleFor, test } from 'ember-qunit';

moduleFor('service:api', 'Unit | Service | api', {
  // Specify the other units that are required for this test.
  needs: ['service:active-user', 'service:properties']
});

// Replace this with your real tests.
test('it exists', function(assert) {
  const service = this.subject();
  assert.ok(service);
});
