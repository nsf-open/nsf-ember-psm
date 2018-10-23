import { moduleFor, test } from 'ember-qunit';
import Service from '@ember/service';

const personnelServiceStub = Service.extend({
  init(...args) {
    this._super(...args);
  }
});

moduleFor('controller:proposal/manage-personnel', 'Unit | Controller | proposal/manage-personnel', {
  needs: ['service:properties', 'service:permissions', 'service:proposal-constants', 'service:active-user', 'service:webtrend-analytics', 'service:messages', 'service:proposal'],

  beforeEach() {
    this.register('service:personnel', personnelServiceStub);
    this.inject.service('personnel', { as: 'personnelService' });
  }
});



// Test controller exists
test('it exists', function(assert) {
  const controller = this.subject();
  assert.ok(controller);
});

// Test controller breadcrumb is set
test('breadcrumb set', function(assert) {
  const controller = this.subject();
  assert.equal(controller.breadCrumb, 'Manage Personnel');
});

// Verify resetAddCoPI method works
test('reset Add CoPI Modal inputs', function(assert) {
  const controller = this.subject();

  // assert: should start off empty
  assert.equal(controller.get('searchCoPIbyID'), '');
  assert.equal(controller.get('searchCoPIbyEmail'), '');

  // set values
  controller.set('searchCoPIbyID', '123456789');
  controller.set('searchCoPIbyEmail', 'tony@email.com');

  // clear values
  controller.send('resetAddCoPI');

  // assert: should be empty again
  assert.equal(controller.get('searchCoPIbyID'), '');
  assert.equal(controller.get('searchCoPIbyEmail'), '');
});

// Verify resetAddOtherSeniorPersonnel method works
test('reset Add Other Senior Personnel Modal inputs', function(assert) {
  const controller = this.subject();

  // assert: should start off empty
  assert.equal(controller.get('searchOtherSeniorPersonnelbyID'), '');
  assert.equal(controller.get('searchOtherSeniorPersonnelbyEmail'), '');

  // set values
  controller.set('searchOtherSeniorPersonnelbyID', '123456789');
  controller.set('searchOtherSeniorPersonnelbyEmail', 'tony@email.com');

  // clear values
  controller.send('resetAddOtherSeniorPersonnel');

  // assert: should be empty again
  assert.equal(controller.get('searchOtherSeniorPersonnelbyID'), '');
  assert.equal(controller.get('searchOtherSeniorPersonnelbyEmail'), '');
});

// Verify resetAddAssistant method works
test('reset Add OAU Modal inputs', function(assert) {
  const controller = this.subject();

  // assert: should start off empty
  assert.equal(controller.get('searchOAUbyID'), '');
  assert.equal(controller.get('searchOAUbyEmail'), '');

  // set values
  controller.set('searchOAUbyID', '123456789');
  controller.set('searchOAUbyEmail', 'tony@email.com');

  // clear values
  controller.send('resetAddOAU');

  // assert: should be empty again
  assert.equal(controller.get('searchOAUbyID'), '');
  assert.equal(controller.get('searchOAUbyEmail'), '');
});
