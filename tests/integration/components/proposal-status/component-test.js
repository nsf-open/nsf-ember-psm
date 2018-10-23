import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('proposal-status', 'Integration | Component | proposal status', {
  integration: true
});

test('places description input in correct place', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });
  const description = 'this is a test description';
  this.set('testValue', description);

  this.render(hbs`{{#proposal-status description=testValue }}{{/proposal-status }}`);

  assert.equal(this.$('h4').text().trim(), description);
});
