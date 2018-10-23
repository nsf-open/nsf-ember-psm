import { moduleFor, test } from 'ember-qunit';

moduleFor('service:custom-form', 'Unit | Service | custom form', {
  // Specify the other units that are required for this test.
  needs: ['service:activeUser']
});

// Replace this with your real tests.
test('it exists', function(assert) {
  const service = this.subject();
  assert.ok(service);
});
