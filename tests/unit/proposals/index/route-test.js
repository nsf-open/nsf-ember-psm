import { moduleFor, test } from 'ember-qunit';

moduleFor('route:proposals/index', 'Unit | Route | proposals/index', {
  // Specify the other units that are required for this test.
  needs: ['service:properties', 'service:messages', 'service:proposal', 'service:proposal-constants', 'service:webtrend-analytics']
});

test('it exists', function(assert) {
  const route = this.subject();
  assert.ok(route);
});
