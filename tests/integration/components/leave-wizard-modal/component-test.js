import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('leave-wizard-modal', 'Integration | Component | leave wizard modal', {
  integration: true
});

test('it renders', function(assert) {
  this.render(hbs`{{leave-wizard-modal}}`);

  assert.equal(this.$('[data-test-leave-wizard-modal-title]').text().trim(), 'Proposal Set Up Information May Be Lost');
});
