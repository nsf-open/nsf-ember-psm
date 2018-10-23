import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default Route.extend({

  messageService: service('messages'),

  actions: {
    willTransition() {
      // Clear on screen error/success messages when leaving route
      this.get('messageService').clearScreenMessages();
      return true; // will call parent willTransition()
    }
  }

});
