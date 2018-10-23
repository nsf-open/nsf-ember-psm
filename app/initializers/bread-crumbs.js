export default {
  name: 'ember-breadcrumbs',
  initialize() {
    const application = arguments[1] || arguments[0];
    application.inject('component:bread-crumbs', 'router', 'router:main');
    application.inject('component:bread-crumbs', 'applicationController', 'controller:application');
  }
};


/*
export function initialize(/* application ) {
  // application.inject('route', 'foo', 'service:foo');
}

export default {
  name: 'bread-crumbs',
  initialize
};
*/
