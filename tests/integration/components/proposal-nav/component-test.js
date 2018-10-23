import EmberObject from '@ember/object';
import { getOwner } from '@ember/application';
import hbs from 'htmlbars-inline-precompile';
import { moduleForComponent, test } from 'ember-qunit';


moduleForComponent('proposal-nav', 'Integration | Component | proposal nav', {
  integration: true,
  beforeEach() {
    const routerMain = getOwner(this).lookup('router:main');
    routerMain.targetState = {
      routerJsState: {}
    };
  }
});

test('proposal nav renders', function(assert) {
  this.set('proposal', EmberObject.create({}));
  this.render(hbs`{{proposal-nav proposal=proposal}}`);

  // Verify it now says Show Menu
  assert.equal(this.$('[data-test-proposal-nav-hide]').text(), 'Hide Menu');
});

// test('proposal nav main menu click', function(assert) {
//
//   this.render(hbs`{{proposal-nav}}`);
//
//   // Click Hide Menu
//   this.$('[data-test-proposal-nav-toggle-link]').trigger("click");
//   //this.$('.psm-proposal-nav li:first-child > a > span').trigger(this.$.Event("click", {target: this.$('.psm-proposal-nav li:first-child > a > span')}));
//
//   // Verify it now says Show Menu
//   assert.equal(this.$('[data-test-proposal-nav-hide]').text(),'Show Menu');
//
//   // Verify menu items are not visible - doesn't work now because it doesn't occur until after an animation
//   //assert.equal(this.$('.psm-proposal-nav li:visible').length,2); // also not sure 2 is the right answer
//
//   // Click Show Menu and verify it now says Hide Menu
//   this.$('[data-test-proposal-nav-toggle-link]').trigger("click");
//   assert.equal(this.$('[data-test-proposal-nav-hide]').text(),'Hide Menu');
//
// });

// test('proposal nav submenu click', function(assert) {
//
//   this.render(hbs`{{proposal-nav}}`);
//
//   // Verify Budgets menu item exists
//   assert.equal(this.$('[data-test-nav-budgets]').text(),'Budget(s)');
//
//   // Click Required Submenu item
//   this.$('#requiredItemsLink').trigger("click");
//
//   // Verify Budgets menu item is not visible - doesn't work now because it doesn't hide until after an animation
//   //assert.equal(this.$('.psm-proposal-nav li a:contains(\'Budgets\')').is(':visible'),false);
//
// });
