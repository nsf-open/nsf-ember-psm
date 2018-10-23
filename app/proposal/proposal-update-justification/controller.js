import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import $ from 'jquery';

export default Controller.extend({

  breadCrumb: 'Proposal Update Justification',

  props: service('properties'),
  activeUser: service('active-user'),
  permissions: service('permissions'),
  proposalService: service('proposal'),
  messageService: service('messages'),
  PROPOSAL_CONSTANTS: service('proposal-constants'),

  isPUJModified: false, // use isBudgetModified to detect changes on budget fields
  exitPUJTransition: null, // use this to store a temporary transition object if user needs to confirm

  init(...args) {
    this._super(...args);

    this.set('messageTexts', {
      'success_generic': 'The proposal update justification has been successfully saved.',
      'fail_generic': this.get('PROPOSAL_CONSTANTS').SYSTEM_ERROR.PROPOSAL_JUSTIFICATION
    });
  },

  justificationText: computed('model', function() {
    return this.get('model').justificationText;
  }),

  textareaDisabled: computed('permissions.permissions.[]', function() {
    return !this.get('permissions').hasPermission('proposal.data.modify');
  }),

  displayNavigationConfirm(transitionTarget) {
    this.set('exitPUJTransition', transitionTarget);
    const modal = $("div .modal[id*='-unsavedExitConfirmationModal']")[0];
    $(modal).modal();
  },

  actions: {

    exitPUJConfirmed() {
      this.set('isPUJModified', false); // clear isPUJModified so navigation is not blocked again
      this.transitionToRoute(this.get('exitPUJTransition'));// navigate to exitPUJTransition
      this.set('exitPUJTransition', null); // clear exitPUJTransition property for the future
    },
    exitPUJCancelled() {
      // revert proposal-nav focus state to PUJ
      $('#allItems li').removeClass('activated');
      $('[data-test-nav-proposal-update-justification]').addClass('activated');

      this.set('exitPUJTransition', null);
    },

    pujTextChanged() {
      if (this.get('justificationText') !== this.get('model').justificationText) {
        this.set('isPUJModified', true);
      }
      else {
        this.set('isPUJModified', false);
      }
    },

    saveJustification() {
      const textToSave = (this.get('justificationText')) ? this.get('justificationText').trim() : '';
      if (this.get('justificationText') && textToSave !== this.get('justificationText')) {
        this.set('justificationText', textToSave);
      }

      const propPrepId = this.get('model').propPrepId;
      const propRevId = this.get('model').propRevId;
      this.get('messageService').clearActionMessages();

      const jsonDataToSave = {
        'justificationText': textToSave,
        'propRevId': propRevId
      };

      this.get('proposalService').saveProposalJustification({ data: jsonDataToSave, propPrepId, propRevId })
      .then((data) => {
          let errorFound = false;
          if (data.messages) {
            for (let i = 0; i < data.messages.length; i += 1) {
              if (data.messages[i].type == 'ERROR') {
                errorFound = true;
                const message = {status: 'error', dismissable: false, message: data.messages[i].description};
                this.get('messageService').addMessage(message);
              }
              else if (data.messages[i].type == 'WARNING') {
                const message = {status: 'warning', dismissable: false, message: data.messages[i].description};
                this.get('messageService').addMessage(message);
              }
              else if (data.messages[i].type == 'INFORMATION') {
                const message = {status: 'info', dismissable: false, message: data.messages[i].description};
                this.get('messageService').addMessage(message);
              }
            }
          }
          if (!errorFound) {
            const message = {status: 'success', dismissable: false, message: this.get('messageTexts.success_generic')};
            this.get('messageService').addMessage(message);
          }
          this.set('isPUJModified', false);
        }, () => {
          const message = {status: 'error', dismissable: false, message: this.get('messageTexts.fail_generic')};
          this.get('messageService').addMessage(message);
        });
    }
  }

});
