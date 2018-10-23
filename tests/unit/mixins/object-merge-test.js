import EmberObject from '@ember/object';
import { module, test } from 'qunit';
import ObjectMergeMixin from 'psm/mixins/object-merge';

module('Unit | Mixin | object merge');

// Replace this with your real tests.
test('it works', function(assert) {
  const ObjectMergeObject = EmberObject.extend(ObjectMergeMixin);
  const subject = ObjectMergeObject.create();
  assert.ok(subject);
});
