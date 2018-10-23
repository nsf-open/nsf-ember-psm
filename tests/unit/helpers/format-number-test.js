import { formatNumber } from 'psm/helpers/format-number';
import { module, test } from 'qunit';

module('Unit | Helper | format number');

// Replace this with your real tests.
test('it works', function(assert) {
  const result = formatNumber([42]);
  assert.ok(result);
});

// Test a few different number formats
test('number format testing', function(assert) {
  let result = formatNumber([5]);
  assert.equal(result, '5');

  result = formatNumber([1000]);
  assert.equal(result, '1,000');

  result = formatNumber([7000000]);
  assert.equal(result, '7,000,000');

  result = formatNumber(['Error']);
  assert.equal(result, 'Error');
});
