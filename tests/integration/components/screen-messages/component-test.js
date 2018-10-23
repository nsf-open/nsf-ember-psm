import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('screen-messages', 'Integration | Component | screen messages', {
  integration: true
});

test('it renders', function(assert) {
  this.render(hbs`{{screen-messages}}`);

  assert.equal(this.$().text().trim(), '');
});
