import { moduleFor, test } from 'ember-qunit';

moduleFor('service:proposal-status', 'Unit | Service | proposal status', {
  // Specify the other units that are required for this test.
  needs: ['service:proposal']
});

// Replace this with your real tests.
test('it exists', function(assert) {
  const service = this.subject();
  assert.ok(service);
});
