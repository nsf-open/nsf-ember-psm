import CommonUtilityMixin from 'psm/mixins/common-utility';
import EmberObject from '@ember/object';
import { module, test } from 'qunit';

module('Unit | Mixin | common utility');

// Replace this with your real tests.
test('it works', function(assert) {
  const CommonUtilityObject = EmberObject.extend(CommonUtilityMixin);
  const subject = CommonUtilityObject.create();
  assert.ok(subject);
});

// Test methods of common-utility
test('methods for common-utility', function(assert) {
  const CommonUtilityObject = EmberObject.extend(CommonUtilityMixin);
  const subject = CommonUtilityObject.create();

  assert.equal(subject.moneyFormat(4000, 2), '4,000.00');
  assert.equal(subject.moneyFormat(4000, 1), '4,000.0');
  assert.equal(subject.moneyFormat(4000, 0), '4,000');

  assert.equal(subject.moneyFormat(4000, 2, 3), '4,000.00');
  assert.equal(subject.moneyFormat(4000, 2, 2), '40,00.00');
  assert.equal(subject.moneyFormat(4000, 2, 1), '4,0,0,0.00');
});
