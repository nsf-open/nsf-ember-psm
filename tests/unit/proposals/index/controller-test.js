import { moduleFor, test } from 'ember-qunit';

moduleFor('controller:proposals/index', 'Unit | Controller | proposals/index', {
  // Specify the other units that are required for this test.
  needs: ['service:properties', 'service:webtrend-analytics']
});

// Replace this with your real tests.
test('it exists', function(assert) {
  const controller = this.subject();
  assert.ok(controller);
});
