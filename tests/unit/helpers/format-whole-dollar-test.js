
import { formatWholeDollar } from 'psm/helpers/format-whole-dollar';
import { module, test } from 'qunit';

module('Unit | Helper | format whole dollar');

// Replace this with your real tests.
test('it works', function(assert) {
  const result = formatWholeDollar([42]);
  assert.ok(result);
});

// Test a few different dollar formats
test('dollar format testing', function(assert) {
  let result = formatWholeDollar([5]);
  assert.equal(result, '$5');

  result = formatWholeDollar([1000]);
  assert.equal(result, '$1,000');

  result = formatWholeDollar([7000000]);
  assert.equal(result, '$7,000,000');

  result = formatWholeDollar(['Error']);
  assert.equal(result, 'Error');
});

