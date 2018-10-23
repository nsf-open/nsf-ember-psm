import Component from '@ember/component';
import { computed } from '@ember/object';
import { A } from '@ember/array';
import { isArray } from '@ember/array';
import { isBlank } from '@ember/utils';
import Object from '@ember/object';
import { get } from '@ember/object';
import { isPresent } from '@ember/utils';

export default Component.extend({
  router: null,
  applicationController: null,

  handlerInfos: computed('applicationController.currentPath', function() {
    const router = this.get('router')._routerMicrolib || this.get('router').router;
    return router.currentHandlerInfos;
  }),

  /*
    For the pathNames and controllers properties, we must be careful not to NOT
    specify the properties of the route in our dependent keys.

    Observing the controller property of the route causes some serious problems:
    https://github.com/chrisfarber/ember-breadcrumbs/issues/21
  */

  pathNames: computed('handlerInfos.[]', function() {
    return this.get('handlerInfos').map(function(handlerInfo) {
      return handlerInfo.name;
    });
  }),

  controllers: computed('handlerInfos.[]', function() {
    return this.get('handlerInfos').map(function(handlerInfo) {
      return handlerInfo.handler.controller;
    });
  }),

  breadCrumbs: computed('controllers.{@each.breadCrumbs,@each.breadCrumb,@each.breadCrumbPath,@each.breadCrumbModel}',
    'pathNames.[]', function() {
      const controllers = this.get('controllers');
      const defaultPaths = this.get('pathNames');
      const breadCrumbs = A([]);

      controllers.forEach(function(controller, index) {
        // updated per: https://github.com/chrisfarber/ember-breadcrumbs/issues/49 - TB
        // const crumbs = controller.get('breadCrumbs') || A([]);
        // const singleCrumb = controller.get('breadCrumb');
        const controllerCrumbs = controller.get('breadCrumbs');
        const crumbs = isArray(controllerCrumbs) ? controllerCrumbs.slice() : A([]);
        const singleCrumb = controller.get('breadCrumb');

        if (!isBlank(singleCrumb)) {
          crumbs.push({
            label: singleCrumb,
            path: controller.get('breadCrumbPath'),
            model: controller.get('breadCrumbModel'),
          });
        }

        crumbs.forEach(function (crumb) {
          breadCrumbs.addObject(Object.create({
            label: crumb.label,
            path: crumb.path || defaultPaths[index],
            model: crumb.model,
            action: crumb.action, // crumb.action,
            linkable: isPresent(crumb.linkable) ? crumb.linkable : crumb.path !== false,
            isCurrent: false
          }));
        });
      });

      const deepestCrumb = get(breadCrumbs, 'lastObject');
      if (deepestCrumb) {
        deepestCrumb.isCurrent = true;
      }

      return breadCrumbs.uniqBy('label');
    }),

  actions: {
    clickBreadCrumb(path) {
      this.onNavLinkClick({linkInfo: path})
    },
    passAction(action) {
      function checkController(controller) {
        if (controller.get('actions') === undefined) { return false; }
        return Object.prototype.hasOwnProperty.call(controller.get('actions'), this);
        // return controller.get('actions').hasOwnProperty(this);
      }

      const aController = this.get('controllers').find(checkController, action);
      aController.send(action);
    }
  }
});
