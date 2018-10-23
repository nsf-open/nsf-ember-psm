
import { formatDate } from 'psm/helpers/format-date';
import { module, test } from 'qunit';

module('Unit | Helper | format date');

// Replace this with your real tests.
test('it works', function(assert) {
  const result = formatDate([42]);
  assert.ok(result);
});

// Test a few different date formats
test('date format testing', function(assert) {
  let result = formatDate([20161018]);
  assert.equal(result, '10/18/2016');

  result = formatDate([20161015]);
  assert.equal(result, '10/15/2016');

  result = formatDate([20161022]);
  assert.equal(result, '10/22/2016');

  result = formatDate([20170101]);
  assert.equal(result, '01/01/2017');
});
