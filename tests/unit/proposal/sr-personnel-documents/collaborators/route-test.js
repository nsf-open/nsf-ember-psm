import { moduleFor, test } from 'ember-qunit';

moduleFor('route:proposal/sr-personnel-documents/collaborators', 'Unit | Route | proposal/sr personnel documents/collaborators', {
  needs: ['service:section-lookup', 'service:properties', 'service:page-info', 'service:active-user', 'service:messages', 'service:permissions', 'service:personnel', 'service:webtrend-analytics']
});

test('it exists', function(assert) {
  const route = this.subject();
  assert.ok(route);
});
