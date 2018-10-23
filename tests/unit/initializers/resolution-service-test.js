import Application from '@ember/application'
import destroyApp from '../../helpers/destroy-app';
import { initialize } from 'psm/initializers/resolution-service';
import { run } from '@ember/runloop';
import { module, test } from 'qunit';

module('Unit | Initializer | resolution service', {
  beforeEach() {
    run(() => {
      this.application = Application.create();
      this.application.deferReadiness();
    });
  },
  afterEach() {
    destroyApp(this.application);
  }
});

// Replace this with your real tests.
test('it works', function(assert) {
  initialize(this.application);

  // you would normally confirm the results of the initializer here
  assert.ok(true);
});
