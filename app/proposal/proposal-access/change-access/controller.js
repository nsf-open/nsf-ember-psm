import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { alias } from '@ember/object/computed';
import { computed } from '@ember/object';


export default Controller.extend({
  activeUser: service('active-user'),
  messageService: service('messages'),
  permissions: service('permissions'),
  PROPOSAL_CONSTANTS: service('proposal-constants'),
  proposalService: service('proposal'),
  props: service('properties'),
  transitionService: service('transition'),

  accessLevel: alias('model.accessData.proposalPackage.proposalStatus'),
  breadCrumb: 'Change Proposal Access for SPO/AOR',

  init(...args) {
    this._super(...args);

    this.set('messageTexts', {
      'fail_generic': this.get('PROPOSAL_CONSTANTS').SYSTEM_ERROR.ACCESS_CHANGE,
      'success_generic': 'The proposal access has been successfully changed. Please communicate with your institution\'s SPO/AOR to let them know about their updated access as needed.'
    });
  },

  accessLevelSubmission: computed('accessLevel', function() {
    const accessLevel = this.get('accessLevel');
    if (accessLevel === '04' || accessLevel === '11' || accessLevel === '16') { // '04'/'11'/'16'=Submit
      return true;
    }
    return false;
  }),

  allowSubmissionDisabled: computed('accessLevel', function() {
    const accessLevel = this.get('accessLevel');
    if (accessLevel === '02' || accessLevel === '04' || this.get('accessLevel') === '09' || this.get('accessLevel') === '11' || this.get('accessLevel') === '14' || this.get('accessLevel') === '16') { // =View/Edit or Submit Access
      return false;
    }
    return true;
  }),

  allowSubmissionDisabledText: computed('allowSubmissionDisabled', function() {
    const isDisabled = this.get('allowSubmissionDisabled');
    if (isDisabled) {
      return 'Edit access must be selected first';
    }
    return '';
  }),

  accessLevelEdit: computed('accessLevel', function() {
    const accessLevel = this.get('accessLevel');
    const accessLevelInt = parseInt(this.get('accessLevel'), 10);
    if (accessLevel === '02' || accessLevel === '04' || accessLevel === '09' || accessLevel === '11' || accessLevel === '14' || accessLevel === '16') {
      return accessLevel;
    }
    else if (accessLevelInt >= 12) {
      return '14';
    }
    else if (accessLevelInt >= 7) {
      return '09';
    }
    return '02';
  }),

  accessLevelViewOnly: computed('accessLevel', function() {
    const accessLevel = this.get('accessLevel');
    const accessLevelInt = parseInt(this.get('accessLevel'), 10);
    if (accessLevel === '01' || accessLevel === '08' || accessLevel === '13') {
      return accessLevel;
    }
    else if (accessLevelInt >= 12) {
      return '13';
    }
    else if (accessLevelInt >= 5) {
      return '08';
    }
    return '01';
  }),

  accessLevelNoAccess: computed('accessLevel', function() {
    const accessLevel = this.get('accessLevel');
    const accessLevelInt = parseInt(this.get('accessLevel'), 10);
    if (accessLevel === '00' || accessLevel === '03' || accessLevel === '05' || accessLevel === '06'
      || accessLevel === '07' || accessLevel === '10' || accessLevel === '12' || accessLevel === '15') {
      return accessLevel;
    }
    else if (accessLevelInt >= 12) {
      return '12';
    }
    else if (accessLevelInt >= 8) {
      return '07';
    }
    return '00';
  }),

  reInit() {
    if (this.get('accessLevel') === '04' || this.get('accessLevel') === '11' || this.get('accessLevel') === '16') {
      this.set('accessLevelSubmission', true);
    }
    else {
      this.set('accessLevelSubmission', false);
    }
  },

  actions: {
    accessLevelChange(accessLevel) {
      if (accessLevel !== '02' && accessLevel !== '04' && accessLevel !== '09' && accessLevel !== '11' && accessLevel !== '14' && accessLevel !== '16') { // =View/Edit or Submit Access
        this.set('accessLevelSubmission', false);
      }
    },
    allowSubmissionChange(event) {
      if (event && event.target) {
        if (event.target.checked) {
          if (this.get('accessLevel') === '00' || this.get('accessLevel') === '01' || this.get('accessLevel') === '02' || this.get('accessLevel') === '03') {
            this.set('accessLevel', '04');
          }
          else if (this.get('accessLevel') === '07' || this.get('accessLevel') === '08' || this.get('accessLevel') === '09' || this.get('accessLevel') === '10') {
            this.set('accessLevel', '11');
          }
          else {
            this.set('accessLevel', '16');
          }
          return;
        }
      }
      if (this.get('accessLevel') === '00' || this.get('accessLevel') === '01' || this.get('accessLevel') === '03' || this.get('accessLevel') === '04') {
        this.set('accessLevel', '02');
      }
      else if (this.get('accessLevel') === '07' || this.get('accessLevel') === '08' || this.get('accessLevel') === '10' || this.get('accessLevel') === '11') {
        this.set('accessLevel', '09');
      }
      else {
        this.set('accessLevel', '14');
      }
    },
    saveAccess() {
      let accessLevelToSave = '';

      if (this.get('accessLevelSubmission')) {
        if (this.get('accessLevel') === '00' || this.get('accessLevel') === '01' || this.get('accessLevel') === '02' || this.get('accessLevel') === '03' || this.get('accessLevel') === '04') {
          accessLevelToSave = '04';
        }
        else if (this.get('accessLevel') === '07' || this.get('accessLevel') === '08' || this.get('accessLevel') === '09' || this.get('accessLevel') === '10' || this.get('accessLevel') === '11') {
          accessLevelToSave = '11';
        }
        else {
          accessLevelToSave = '16';
        }
      }
      else {
        accessLevelToSave = this.get('accessLevel');
      }

      this.get('messageService').clearActionMessages();

      const accessDataToSave = {
        'propPrepId': this.get('model.propPrepId'),
        'propRevId': this.get('model.propRevId'),
        'proposalStatus': accessLevelToSave
      };

      this.get('transitionService').setAjaxInProgress(true);

      this.get('proposalService').saveProposalAccess(accessDataToSave).then((data) => {
        if (data.messages) {
          for (let i = 0; i < data.messages.length; i += 1) {
            if (data.messages[i].type == 'ERROR') {
              const message = {status: 'error', dismissable: false, message: this.get('messageTexts.fail_generic')};
              this.get('messageService').addMessage(message);
              return;
            }
          }
        }

        const message = {
          status: 'success',
          dismissable: true,
          message: this.get('messageTexts.success_generic'),
          level: this.get('messageService').LEVEL_CROSS_SCREEN,
          displayRoute: 'proposal.proposal-access.index'
        };
        this.get('messageService').addMessage(message);

        this.get('transitionService').setAjaxInProgress(false);
        this.get('proposalController').send('reloadProposal');
        this.transitionToRoute('proposal.proposal-access');
      }, () => {
        this.get('transitionService').setAjaxInProgress(false);

        const message = {status: 'error', dismissable: false, message: this.get('messageTexts.fail_generic')};
        this.get('messageService').addMessage(message);
      });


    },

  }

});
