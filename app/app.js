import Application from '@ember/application';
import Resolver from './resolver';
import loadInitializers from 'ember-load-initializers';
import config from './config/environment';
import { Promise as rsvpPromise } from 'rsvp';

import './overrides/datetime-picker';

// If the browser doesn't have Promise defined place rsvp implementation
if(window.Promise === undefined) {
  window.Promise = rsvpPromise;
}

const App = Application.extend({

  modulePrefix: config.modulePrefix,
  podModulePrefix: config.podModulePrefix,
  Resolver
});

loadInitializers(App, config.modulePrefix);

export default App;
