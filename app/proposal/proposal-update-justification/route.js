import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { hash } from 'rsvp';
import $ from 'jquery';

export default Route.extend({
  activeUser: service('active-user'),
  messageService: service('messages'),
  permissions: service('permissions'),
  proposalService: service('proposal'),
  props: service('properties'),
  sectionLookup: service('section-lookup'),

  beforeModel() {
    const proposal = this.modelFor('proposal');

    if ((['01', '08'].indexOf(proposal.proposalStatus) > -1) && !this.get('permissions').hasPermission('proposal.data.modify')) {
      const message = {
        status: 'info',
        dismissable: false,
        message: 'You currently have view only access to the proposal. This access level is controlled by the PI/co-PIs on the proposal.',
        level: this.get('messageService').LEVEL_SCREEN
      }
      this.get('messageService').addMessage(message);
    }
  },

  model() {
    const proposal = this.modelFor('proposal');
    const { propPrepId, propRevId } = proposal;

    return hash({
      justification: this.get('proposalService').getProposalJustification({propPrepId, propRevId})
    }).then((hash) => {
      return {
        'propPrepId': propPrepId,
        'propRevId': propRevId,
        'proposalStatus': proposal.proposalStatus,
        'justificationText': hash.justification.proposalUpdateJustification.justificationText
      }
    });
  },

  activate () {
    window.scrollTo(0, 0);
  },

  setupController(controller, models) {
    this._super(controller, models);
    controller.setProperties(models);
    $(window).on('beforeunload', () => {
      if (this.controller.get('isPUJModified')) {
        return 'You are about to leave a page that has unsaved data.';
      }
    });
  },

  actions: {
    willTransition(transition) {
      if (this.controller.get('isPUJModified')) {
        transition.abort();
        this.controller.displayNavigationConfirm(transition.targetName);
        return false;
      }
      this.get('messageService').clearScreenMessages();
      window.onbeforeunload = null;

      return true;
    }
  }

});
