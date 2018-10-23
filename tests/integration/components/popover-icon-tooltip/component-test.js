import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('popover-icon-tooltip', 'Integration | Component | popover icon tooltip', {
  integration: true
});

test('it renders', function(assert) {
  this.render(hbs`{{popover-icon-tooltip '' ''}}`);

  assert.equal(this.$().text().trim(), '');
});
