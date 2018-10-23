import { moduleFor, test } from 'ember-qunit';

import { singleBaseSetup } from '../../../util/single-file-base-setup';

const singleBaseInject = singleBaseSetup();

const sectionInfoObject = {
  BIOSKETCH: {
    name: 'Biographical Sketch',
    code: '02'
  }
};

moduleFor('controller:proposal/sr-personnel-documents/bio-sketch', 'Unit | Controller | proposal/sr-personnel-documents/bio-sketch', {
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
  assert.equal(controller.get('breadCrumb'), 'Biographical Sketch - Tony Brown');
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

  assert.equal(controller.get('sectionInfo').name, 'Biographical Sketch');
  assert.equal(controller.get('sectionInfo').code, '02');
});
