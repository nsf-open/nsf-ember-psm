import { moduleFor, test } from 'ember-qunit';

import { singleBaseSetup } from '../../../util/single-file-base-setup';

const singleBaseInject = singleBaseSetup({
  BIOSKETCH: {
    name: 'Collaborators and Other Affiliations',
    code: '03'
  }
});

moduleFor('controller:proposal/sr-personnel-documents/collaborators', 'Unit | Controller | proposal/sr personnel documents/collaborators', {
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
