import { moduleFor, test } from 'ember-qunit';

import { singleBaseSetup } from '../../util/single-file-base-setup';

const singleBaseInject = singleBaseSetup();

const sectionInfoObject = {
  BUDGET_JUST: {
    name: 'Budget Justification',
    code: '10'
  }
};

moduleFor('controller:proposal/budget-justification', 'Unit | Controller | proposal/budget-justification', {
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
  assert.equal(controller.breadCrumb, 'Budget Justification(s)');
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

  assert.equal(controller.get('sectionInfo').name, 'Budget Justification');
  assert.equal(controller.get('sectionInfo').code, '10');
});
