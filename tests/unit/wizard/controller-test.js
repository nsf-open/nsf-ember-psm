import { moduleFor, test } from 'ember-qunit';

moduleFor('controller:wizard', 'Unit | Controller | wizard', {
  needs: ['service:properties', 'service:webtrend-analytics']
});

// Replace this with your real tests.
test('it exists', function(assert) {
  const controller = this.subject();
  assert.ok(controller);
});
