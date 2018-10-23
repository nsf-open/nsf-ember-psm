import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { hashSettled } from 'rsvp';
import $ from 'jquery';

export default Route.extend({
  props: service('properties'),
  activeUser: service('active-user'),
  messageService: service('messages'),
  permissions: service('permissions'),
  personnelService: service('personnel'),
  postDocMentoringPlanService: service('proposal/postdoc-mentoring-plan'),

  activate () {
    window.scrollTo(0, 0);
  },

  beforeModel() {
    const proposal = this.modelFor('proposal');

    if ((['01', '08', '13'].indexOf(proposal.proposalStatus) > -1) && !this.get('permissions').hasPermission('proposal.budget.modify')) {
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

  // initial load of the model
  model() {
    const proposal = this.modelFor('proposal');
    const { propPrepId, propRevId } = proposal;
    return hashSettled({
      lookupSrPerson: this.get('personnelService').getSeniorPersonnelRoles(),
      lookupOtherPerson: this.get('personnelService').getOtherPersonnelRoles(),
      hasPostDocPlan: this.get('postDocMentoringPlanService').getPostDocFileInfo({propPrepId, propRevId})
    }).then((hash) => {
      hash.propPrepId = proposal.propPrepId;
      hash.propRevId = proposal.propRevId;
      hash.institutionName = proposal.institution.organizationName;
      hash.institutionId = proposal.institution.id;
      hash.proposalStatus = proposal.proposalStatus;
      hash.isCollaborativeProposal = proposal.isCollaborativeProposal;
      hash.isInPFUStatus = proposal.get('isInPFUStatus');
      return hash;
    });
  },

  setupController(controller, models) {
    this._super(controller, models);
    controller.setProperties(models);
    controller.reInit();
    $(window).on('beforeunload', () => {
      if (this.controller.get('isBudgetModified')) {
        return 'You are about to leave a page that has unsaved data.';
      }
    });
  },

  actions: {
    willTransition(transition) {
      this.controller.send('clearInfoMessages');
      this.controller.send('clearSuccessMessages');

      if (this.controller.get('isBudgetModified')) {
        this.controller.displayNavigationConfirm(transition.targetName);
        transition.abort();
        return false;
      }

      window.onbeforeunload = null;

      this.controller.get('messageService').clearScreenMessages();

      return true;
    }
  }

});
