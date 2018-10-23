import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

import { updatePageTitleAfterModel } from './sr-personnel-documents/util';

export default Route.extend({
  messageService: service('messages'),
  permissions: service('permissions'),
  props: service('properties'),
  sectionLookup: service('section-lookup'),

  updateTitleAfterModel: false,

  init(...args) {
    this._super(...args);
    if(!this.get('proposalStatusesForMessage')) {
      this.set('proposalStatusesForMessage', ['01', '08']);
    }
  },

  beforeModel() {
    const proposal = this.modelFor('proposal');
    const proposalStatusesForMessage = this.get('proposalStatusesForMessage');

    if (this.routeProposalStatusGuard && !this.routeProposalStatusGuard(proposal)) {
      return this.transitionTo('proposal');
    }

    if ((proposalStatusesForMessage.indexOf(proposal.proposalStatus) > -1) && !this.get('permissions').hasPermission('proposal.data.modify')) {
      const message = {
        status: 'info',
        dismissable: false,
        message: 'You currently have view only access to the proposal. This access level is controlled by the PI/co-PIs on the proposal.',
        level: this.get('messageService').LEVEL_SCREEN
      }
      this.get('messageService').addMessage(message);
    }
    return this.get('props').load();
  },

  model() {
    const proposal = this.modelFor('proposal');
    return {
      'propPrepId': proposal.propPrepId,
      'propRevId': proposal.propRevId,
      'institutionId': proposal.institution.id,
      'proposalStatus': proposal.proposalStatus
    };
  },

  afterModel(model, transition) {
    if (this.get('updateTitleAfterModel')) {
      updatePageTitleAfterModel.call(this, model, transition);
    }

    const controller = this.controllerFor(transition.targetName);
    const sectionObject = this.get('sectionLookup.sectionInfo');
    controller.setSectionInfo(sectionObject);
    return controller.getFileName(model);
  },

  activate() {
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
