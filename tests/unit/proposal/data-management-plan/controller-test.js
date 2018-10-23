import { moduleFor, test } from 'ember-qunit';


import { singleBaseSetup } from '../../util/single-file-base-setup';
// Stub section-lookup

const singleBaseInject = singleBaseSetup();

const sectionInfoObject = {
  DMP: {
    name: 'Data Management Plan',
    code: '12'
  }
};


moduleFor('controller:proposal/data-management-plan', 'Unit | Controller | proposal/data-management-plan', {
  needs: [...singleBaseInject.needs],

  beforeEach() {
    singleBaseInject.singleBaseSetup.call(this);
  }

});

// Replace this with your real tests.
test('it exists', function(assert) {
  const controller = this.subject();
  assert.ok(controller);
});

// Test controller breadcrumb is set
test('breadcrumb set', function(assert) {
  const controller = this.subject();
  assert.equal(controller.breadCrumb, 'Data Management Plan');
});

// Test maxFileSize computed property
test('maxFileSize computed property', function(assert) {
  const controller = this.subject();

  assert.equal(controller.get('maxFileSizeDisplay'), '10MB');
  controller.set('maxFileSize', 20000000);
  assert.equal(controller.get('maxFileSizeDisplay'), '20MB');
});

// Test section lookup
test('section lookup', function(assert) {
  const controller = this.subject();
  controller.setSectionInfo(sectionInfoObject);

  assert.equal(controller.get('sectionInfo').name, 'Data Management Plan');
  assert.equal(controller.get('sectionInfo').code, '12');
});
