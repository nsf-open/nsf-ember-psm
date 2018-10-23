import { moduleFor, test } from 'ember-qunit';

import { singleBaseSetup } from '../../../util/single-file-base-setup';

const singleBaseInject = singleBaseSetup();

const sectionInfoObject = {
  CURR_PEND_SUPP: {
    name: 'Current and Pending Support',
    code: '04'
  }
};

moduleFor('controller:proposal/sr-personnel-documents/support', 'Unit | Controller | proposal/sr-personnel-documents/support', {
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
  controller.set('model', {'personnel': {'personnel': {firstName: 'Tony', lastName: 'Brown'}}, 'personnelId': '123456789', 'propPrepId': '123', 'propRevId': '456'});
  assert.equal(controller.get('breadCrumb'), 'Current and Pending Support - Tony Brown');
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

  assert.equal(controller.get('sectionInfo').name, 'Current and Pending Support');
  assert.equal(controller.get('sectionInfo').code, '04');
});
