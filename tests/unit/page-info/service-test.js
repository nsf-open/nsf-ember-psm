import { moduleFor, test } from 'ember-qunit';

moduleFor('service:page-info', 'Unit | Service | page info', {
  // Specify the other units that are required for this test.
  needs: ['service:permissions', 'service:proposal']
});

// Replace this with your real tests.
test('it exists', function(assert) {
  const service = this.subject();
  assert.ok(service);
});
