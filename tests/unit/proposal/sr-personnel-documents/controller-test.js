import { moduleFor, test } from 'ember-qunit';

moduleFor('controller:proposal/sr-personnel-documents', 'Unit | Controller | proposal/sr-personnel-documents', {
  needs: ['service:properties', 'service:webtrend-analytics']
});

// Test controller exists
test('it exists', function(assert) {
  const controller = this.subject();
  assert.ok(controller);
});

// Test controller breadcrumb is set
test('breadcrumb set', function(assert) {
  const controller = this.subject();
  assert.equal(controller.breadCrumb, 'Senior Personnel Documents');
});
