import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('eq', 'helper:eq', {
  integration: true
});

// Replace this with your real tests.
test('asserts true when true', function(assert) {
  this.set('input1', 1);
  this.set('input2', 1);

  this.render(hbs`{{eq input1 input2 }}`);

  assert.equal(getHelperBoolean.call(this), true);
});

test('asserts false when false', function(assert) {
  this.set('input1', 1);
  this.set('input2', 2);

  this.render(hbs`{{eq input1 input2 }}`);

  assert.equal(getHelperBoolean.call(this), false);
});

test('asserts multiple values correctly', function(assert) {
  this.set('input1', 1);
  this.set('input2', 2);
  this.set('input3', 3);

  this.render(hbs`{{eq input1 input2 input3}}`);

  assert.equal(getHelperBoolean.call(this), false);
});


function getHelperBoolean() {
  const booleanString = this.$().text().trim();
  return JSON.parse(booleanString);
}
