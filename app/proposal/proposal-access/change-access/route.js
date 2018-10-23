import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import { hash } from 'rsvp';

export default Route.extend({
  activeUser: service('active-user'),
  messageService: service('messages'),
  proposalService: service('proposal'),
  props: service('properties'),

  proposalController: computed(function() {
    return this.controllerFor('proposal');
  }),

  beforeModel() {
    return this.get('props').load();
  },

  model() {
    const proposal = this.modelFor('proposal');
    const { propPrepId, propRevId } = proposal;

    return hash({
      'accessData': this.get('proposalService').getProposalAccess({propPrepId, propRevId})
    }).then((hash) => {
      hash.propPrepId = proposal.propPrepId;
      hash.propRevId = proposal.propRevId;
      return hash;
    });
  },

  setupController(controller, models) {
    this._super(controller, models);
    controller.setProperties(models);
    controller.set('proposalController', this.get('proposalController'));
    controller.reInit();
  },

  activate () {
    window.scrollTo(0, 0);
  },

  actions: {
    willTransition() {
      this.get('messageService').clearScreenMessages();
      return true;
    }
  }

});
