import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { hash } from 'rsvp';

export default Route.extend({
  activeUser: service('active-user'),
  messageService: service('messages'),
  proposalService: service('proposal'),
  props: service('properties'),
  transitionService: service('transition'),

  beforeModel() {
    return this.get('props').load();
  },

  model() {
    const proposal = this.modelFor('proposal');
    const { propPrepId, propRevId } = proposal;

    this.get('transitionService').setAjaxInProgress(true);
    return hash({
      'accessData': this.get('proposalService').getProposalAccess({propPrepId, propRevId}),
      'complianceStatus': this.get('proposalService').getComplianceStatus({propPrepId, propRevId})
    }).then((hash) => {
      this.get('transitionService').setAjaxInProgress(false);

      hash.propPrepId = proposal.propPrepId;
      hash.propRevId = proposal.propRevId;
      hash.complianceMessages = hash.complianceStatus.validationMsgs.psmMessages;
      hash.isPFUStatus = proposal.get('isInPFUStatus');
      return hash;
    });
  },

  setupController(controller, models) {
    this._super(controller, models);
    controller.setProperties(models);
    controller.reInit();
  },

  activate () {
    window.scrollTo(0, 0);
  },

  actions: {
    willTransition() {
      // Clear on screen error/success messages when leaving route
      this.get('messageService').clearScreenMessages();

      return true; // will call parent willTransition()
    }
  }

});
