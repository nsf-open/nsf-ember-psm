import { moduleFor, test } from 'ember-qunit';

moduleFor('route:proposal-prep', 'Unit | Route | proposal prep', {
  needs: ['service:properties', 'service:webtrend-analytics', 'service:messages', 'service:proposal']
});

test('it exists', function(assert) {
  const route = this.subject();
  assert.ok(route);
});
