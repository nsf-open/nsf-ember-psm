import { moduleFor, test } from 'ember-qunit';
import { run } from '@ember/runloop';

moduleFor('controller:proposal/sr-personnel-documents/index', 'Unit | Controller | proposal/sr-personnel-documents/index', {
  needs: ['service:properties', 'service:active-user', 'service:proposal-constants', 'service:session', 'service:permissions', 'service:webtrend-analytics']
});

// Test controller exists
test('it exists', function(assert) {
  const controller = this.subject();
  assert.ok(controller);
});

// Test sort is changing properties correctly
test('sortBy sets controller properties', function(assert) {
  const controller = this.subject();

  // check: currentSort, currentSortOrder
  // and computed values: isSortByName, isSortByRole, isSortByOrganization, isSortDesc, isSortAsc

  // first check defaults
  assert.equal(controller.get('currentSort'), 'role');
  assert.equal(controller.get('currentSortOrder'), 'asc');
  assert.equal(controller.get('isSortByName'), false);
  assert.equal(controller.get('isSortByRole'), true);
  assert.equal(controller.get('isSortByOrganization'), false);
  assert.equal(controller.get('isSortAsc'), true);
  assert.equal(controller.get('isSortDesc'), false);

  run(function() {
    controller.send('sortBy', 'organization');
  });
  // sortBy name should update to the following values
  assert.equal(controller.get('currentSort'), 'organization');
  assert.equal(controller.get('currentSortOrder'), 'asc');
  assert.equal(controller.get('isSortByName'), false);
  assert.equal(controller.get('isSortByRole'), false);
  assert.equal(controller.get('isSortByOrganization'), true);
  assert.equal(controller.get('isSortAsc'), true);
  assert.equal(controller.get('isSortDesc'), false);

  // @TODO Can't get the asserts below to work.
  // Computed Properties don't quite update fast enough i think, but not sure how to solve it

  run(function() {
    controller.send('sortBy', 'name');
  });
  // sortBy name should update to the following values
  assert.equal(controller.get('currentSort'), 'name');
  assert.equal(controller.get('currentSortOrder'), 'asc');
  assert.equal(controller.get('isSortByName'), true);
  assert.equal(controller.get('isSortByRole'), false);
  assert.equal(controller.get('isSortByOrganization'), false);
  assert.equal(controller.get('isSortAsc'), true);
  assert.equal(controller.get('isSortDesc'), false);

  run(function() {
    controller.send('sortBy', 'role');
  });
  // sortBy name should update to the following values
  assert.equal(controller.get('currentSort'), 'role');
  assert.equal(controller.get('currentSortOrder'), 'asc');
  assert.equal(controller.get('isSortByName'), false);
  assert.equal(controller.get('isSortByRole'), true);
  assert.equal(controller.get('isSortByOrganization'), false);
  assert.equal(controller.get('isSortAsc'), true);
  assert.equal(controller.get('isSortDesc'), false);

  run(function() {
    controller.send('sortBy', 'role');
  });
  // sortBy name should update to the following values
  assert.equal(controller.get('currentSort'), 'role');
  assert.equal(controller.get('currentSortOrder'), 'desc');
  assert.equal(controller.get('isSortByName'), false);
  assert.equal(controller.get('isSortByRole'), true);
  assert.equal(controller.get('isSortByOrganization'), false);
  assert.equal(controller.get('isSortAsc'), false);
  assert.equal(controller.get('isSortDesc'), true);
});
