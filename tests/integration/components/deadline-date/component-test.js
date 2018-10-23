import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('deadline-date', 'Integration | Component | deadline date', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{deadline-date}}`);

  assert.equal(this.$('h4 > span:first-child').text().trim(), 'Due Date:');

  // Template block usage:
  this.render(hbs`
    {{#deadline-date}}
      template block text
    {{/deadline-date}}
  `);

  assert.equal(this.$('h4 > span:first-child').text().trim(), 'Due Date:');
});
