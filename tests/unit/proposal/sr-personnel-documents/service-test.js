import { moduleFor, test } from 'ember-qunit';
import Service from '@ember/service';

const apiServiceStub = Service.extend({
  init(...args) {
    this._super(...args);
  }
});

moduleFor('service:proposal/sr-personnel-documents', 'Unit | Service | proposal/sr personnel documents', {
  // Specify the other units that are required for this test.
  // needs: ['service:foo']
  beforeEach() {
    this.register(`service:api`, apiServiceStub);
    this.inject.service('api', { as: 'apiService' });
  }
});

// Replace this with your real tests.
test('it exists', function(assert) {
  let service = this.subject();
  assert.ok(service);
});
