import { moduleFor, test } from 'ember-qunit';

import { singleBaseSetup } from '../../util/single-file-base-setup';

const singleBaseInject = singleBaseSetup();

const sectionInfoObject = {
  FER: {
    name: 'Facilities, Equipment and Other Resources',
    code: '11'
  }
};

moduleFor('controller:proposal/facilities-equipment', 'Unit | Controller | proposal/facilities-equipment', {
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
  assert.equal(controller.breadCrumb, 'Facilities, Equipment and Other Resources');
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

  assert.equal(controller.get('sectionInfo').name, 'Facilities, Equipment and Other Resources');
  assert.equal(controller.get('sectionInfo').code, '11');

});
