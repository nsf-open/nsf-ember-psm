import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import $ from 'jquery';

export default Route.extend({

  messageService: service('messages'),

  activate () {
    window.scrollTo(0, 0);

    const self = this;

    $(document.body).on('click.deadline-date-div focusin.deadline-date-div', function(event) {
      if (self.controller) {
        if (self.controller.get('editingDeadline')) {
          const wasInComponent = event.target.id.includes(`${self.controller.componentId}`) || $(event.target).parents(`#${self.controller.componentId}`).length === 1;

          if (!wasInComponent) {
            self.controller.send('cancelDeadlineEdit');
          }
        }
      }

      return true;
    });
  },

  setupController(controller, models) {
    this._super(controller, models);
    controller.setProperties(models);
    controller.reInit();
  },

  actions: {
    willTransition() {
      this.get('messageService').clearScreenMessages();
      $(document).off(`click.${this.controller.componentId} focusin.${this.controller.componentId}`);

      return true;
    }
  }

});
