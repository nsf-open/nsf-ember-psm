import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import $ from 'jquery';

export default Route.extend({
  activeUser: service('active-user'),
  coverSheetService: service('proposal/cover-sheet'),
  countriesService: service('countries'),
  props: service('properties'),
  permissions: service('permissions'),

  messageService: service('messages'),

  proposalController: computed(function() {
    return this.controllerFor('proposal');
  }),

  beforeModel() {
    return this.get('countriesService').loadCountriesStates();
  },

  model() {
    const proposal = this.modelFor('proposal');
    const { propPrepId, propRevId, proposalStatus, propPrepRevnTypeCode } = proposal;
    return this.get('coverSheetService').getCoverSheetData({ propPrepId, propRevId, proposalStatus, propPrepRevnTypeCode });
  },

  setupController(controller, models) {
    this._super(controller, models);
    controller.setProperties(models);
    controller.set('isFormSubmission', true);

    const proposal = this.modelFor('proposal');

    if ((['01', '08'].indexOf(proposal.proposalStatus) > -1) && !this.get('permissions').hasPermission('proposal.data.modify')) {
      const message = {
        status: 'info',
        dismissable: false,
        message: 'You currently have view only access to the proposal. This access level is controlled by the PI/co-PIs on the proposal.',
        level: this.get('messageService').LEVEL_SCREEN
      };
      this.get('messageService').addMessage(message);
    }

    if (models.coverSheet.historicPlace || models.coverSheet.humanSubject || models.coverSheet.intlActivities) {
      const message = controller.get('showAdditionalInfoMessage');
      this.get('messageService').addMessage(message);
    }

    const coverSheetMessages = models.coverSheetMessages;
    if (coverSheetMessages) {
      for (let i = 0; i < coverSheetMessages.length; i += 1) {
        if (coverSheetMessages[i].type && coverSheetMessages[i].description) {
          const message = {status: coverSheetMessages[i].type.toLowerCase(), dismissable: false, message: coverSheetMessages[i].description};
          this.get('messageService').addMessage(message);
        }
      }
    }


    controller.set('proposalController', this.get('proposalController'));
    controller.afterModelLoad();
    $(window).on('beforeunload', () => {
      if (this.controller.get('isCoverSheetModified')) {
        return 'You are about to leave a page that has unsaved data.';
      }
    });
  },


  activate () {
    window.scrollTo(0, 0);
  },

  actions: {

    willTransition(transition) {
      if (this.controller.get('isCoverSheetModified')) {
        this.controller.displayNavigationConfirm(transition.targetName);
        transition.abort();
        return false;
      }

      const currentRouteName = this.controllerFor('application').get('currentRouteName');

      if (transition && transition.targetName !== currentRouteName) { // If not reloading the page
        this.get('messageService').clearScreenMessages();
      }

      $('.date input').off('keyup');
      window.onbeforeunload = null;
      return true; // will call parent willTransition()
    }
  }

});
