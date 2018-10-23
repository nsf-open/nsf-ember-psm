import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { set } from '@ember/object';
import { isEqual } from '@ember/utils'
import $ from 'jquery';

export default Controller.extend({
  init() {
    this._super(...arguments);
    this.breadCrumbs = [
      {label: 'My Desktop', action: 'exitToMyDesktop'},
      {label: 'Proposal Preparation', action: 'showLeaveModal'},
      {label: 'Prepare New Proposal'}
    ]
  },


  stateIndex: 0,
  maxStates: 4, // 0,1,2,3,4 --> 5 states
  proposalInformationTitle: 'Proposal Details',
  props: service('properties'),
  analytics: service('webtrend-analytics'),

  actions: {

    nextState() {
      if (this.stateIndex < this.maxStates) {
        set(this, 'stateIndex', this.stateIndex + 1);
        window.scrollTo(0, 0);

        if (this.stateIndex === 1) {
          this.get('analytics').trackEvent('Next button_Funding Opportunity');
        }
        else if (this.stateIndex === 2) {
          this.get('analytics').trackEvent('Next button_Where to Apply');
        }
        else if (this.stateIndex === 3) {
          this.get('analytics').trackEvent('Next button_Proposal Type');
        }
        else if (this.stateIndex === 4) {
          this.get('analytics').trackEvent('Next button_Submission Type');
        }
      }
    },
    previousState() {
      if (this.stateIndex > 0) {
        set(this, 'stateIndex', this.stateIndex - 1);
        window.scrollTo(0, 0);

        if (this.stateIndex === 0) {
          this.get('analytics').trackEvent('Previous button_Where to Apply');
        }
        else if (this.stateIndex === 1) {
          this.get('analytics').trackEvent('Previous button_Proposal Type');
        }
        else if (this.stateIndex === 2) {
          this.get('analytics').trackEvent('Previous button_Submission Type');
        }
        else if (this.stateIndex === 3) {
          this.get('analytics').trackEvent('Previous button_Proposal Information');
        }
      }
    },
    toState (stateNumber) {
      if (this.stateIndex === 0) { // the funding opportunity screen
        const wizard = this.get('model').wizard;
        const currentFundingOp = wizard.fundingOp;
        const fundingOpChoice = wizard.fundingOpChoice;

        if (currentFundingOp === undefined || isEqual(fundingOpChoice, currentFundingOp) || undefined === wizard.get('uocs') || wizard.get('uocs').length === 0) {
          wizard.set('fundingOp', fundingOpChoice);
          set(this, 'stateIndex', stateNumber);
        }
        else if (!isEqual(fundingOpChoice, currentFundingOp) && wizard.get('uocs').length > 0) {
          set(this, 'desiredState', stateNumber);
          $('#changeFOStateModal').modal('show');
        }
      }
      else {
        set(this, 'stateIndex', stateNumber);
      }
      if (this.stateIndex === 0) {
        this.get('analytics').trackEvent('Funding Opportunity breadcrumb');
      }
      if (this.stateIndex === 1) {
        this.get('analytics').trackEvent('Where to Apply breadcrumb');
      }
      if (this.stateIndex === 2) {
        this.get('analytics').trackEvent('Proposal Type breadcrumb');
      }
      if (this.stateIndex === 3) {
        this.get('analytics').trackEvent('Submission Type breadcrumb');
      }
      if (this.stateIndex === 4) {
        this.get('analytics').trackEvent('Proposal Details breacrumb');
      }
    },

    changeFO() {
      set(this, 'desiredState', null);

      const wizard = this.get('model').wizard;
      wizard.set('fundingOp', wizard.get('fundingOpChoice'));

      // reset the following pages of wizard
      wizard.set('directorates', []);
      wizard.set('uocs', []);
      wizard.set('proposalType', null);
      wizard.set('submissionType', null);

      this.send('nextState');
    },

    revertState() {
      this.get('model').wizard.set('fundingOpChoice', null);
      set(this, 'stateIndex', this.get('desiredState'));
      set(this, 'desiredState', null);
    },

    exitWizard() {
      this.transitionToRoute('proposal-prep');
      this.get('analytics').trackEvent('Previous button_Funding Opportunity');
    },
    showLeaveModal() {
      const wizard = this.get('model').wizard;
      const currentFundingOp = wizard.fundingOp;

      const fundingOpChoice = wizard.fundingOpChoice;

      if (currentFundingOp || fundingOpChoice) {
        $('#wizardExitModal').modal('show');
      }
      else {
        this.send('exitWizard');
      }
    },
    created(proposalPackage) {
      // TB switched to passing params so that model() hook is called for proposal (and therefore permissions is called)
      // this.transitionToRoute('proposal', proposalPackage);
      this.transitionToRoute('proposal', proposalPackage.propPrepId, proposalPackage.propRevId);
    },
    error() {
      this.transitionToRoute('error');
    },

    exitToMyDesktop() {
      if (this.get('props') && this.get('props').uiFeatureToggles && this.get('props').uiFeatureToggles.myDesktopLink) {
        window.open(this.get('props').uiFeatureToggles.myDesktopLink, '_self');
      }
    }

  }


});
