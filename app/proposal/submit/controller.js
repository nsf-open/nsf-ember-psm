import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import { htmlSafe } from '@ember/string';
import { set } from '@ember/object';

export default Controller.extend({

  breadCrumb: 'Submit Proposal',

  props: service('properties'),
  proposalService: service('proposal'),
  activeUser: service('active-user'),
  messageService: service('messages'),
  analytics: service('webtrend-analytics'),

  init() {
    this._super(...arguments);
    this.messageTexts = {
      'ready_for_submission': 'This proposal is ready for submission.',
      'next_disabled_title_text': 'All required fields must be entered before proceeding',
      'success_proposal_submitted': 'The proposal has been submitted for processing. When processing is complete, a proposal ID number will be assigned. This proposal is now available from the Submitted Proposals page.',
      'success_revision_submitted': 'The Proposal File Update/Budget Revision has been successfully submitted and revisions have been automatically accepted.'
    }
  },

  reInit() {
    this.set('proposalCertificationsComplete', false);
    this.set('reviewedProposalInformation', false);
    this.set('hasComplianceErrors', false);
    this.set('hasComplianceWarnings', false);
    this.set('explanation', '');
    this.set('agreeCert', false);
    this.set('ineligible', null);
    this.set('stateIndex', 0);
    this.set('isSubmitted', false);
  },

  hasComplianceErrors: false,
  hasComplianceWarnings: false,
  isSubmitted: false,

  ineligible: null,
  isSubmitting: false,
  explanation: '',
  agreeCert: false,

  nextDisabledText: 'All required fields must be entered before proceeding',

  stateIndex: 0,
  maxStates: 3, // 0,1,2,3 --> 4 screens

  // second Screen Acknowledged
  reviewedProposalInformation: false,

  // Third Screen completed
  proposalCertificationsComplete: false,

  nextDisabled: computed('stateIndex', 'proposalCertificationsComplete', function() {
    const disabled = true;
    const stateIndex = this.get('stateIndex');
    if (stateIndex === 1) {
      return !disabled;
    }
    else if (stateIndex === 2 && this.get('proposalCertificationsComplete')) {
      return !disabled;
    }
    else return disabled;
  }),

  piData: computed('coverSheetData', function() {
    const coverSheetData = this.get('model.coverSheetData');
    const pi = coverSheetData.piCopiList.findBy('personRoleCode', '01');
    return pi;
  }),

  orderedUocs: computed('model.proposalPackageData.uocs', function() {
    return this.get('model.proposalPackageData.uocs').sortBy('uocOrdrNum');
  }),

  proposalCertText: computed('electronicCertificationText.electronicCertScreenText', function() {
    let text = this.get('model.electronicCertificationText.electronicCertScreenText');
    text = text.replace(/\n/g, '<br/>');

    return htmlSafe(text);
  }),

  actions: {

    toState (targetState, trackText) {
      this.get('messageService').clearActionMessages();

      if (targetState === 0) {
        this.set('isLoading', true);
      }
      if (this.get('stateIndex') === 1 && targetState) {
        this.set('reviewedProposalInformation', true);
      }

      set(this, 'stateIndex', targetState);
      window.scrollTo(0, 0);

      switch (trackText) {
        case 'Previous':
          if (this.stateIndex === 1) {
            this.get('analytics').trackEvent('Previous button_Proposal Certifications_Submission');
          }
          if (this.stateIndex === 2) {
            this.get('analytics').trackEvent('Previous button_ Sign and Submit_Submission');
          }
          break;
        case 'Continue':
          this.get('analytics').trackEvent('Continue button_Proposal Certifications_Submission');
          break;
        case 'Review Proposal Information':
          this.get('analytics').trackEvent('Review Proposal Information breadcrumb');
          break;
        case 'Proposal Certifications':
          this.get('analytics').trackEvent('Proposal Certifications breadcrumb');
          break;
        case 'Sign and Submit':
          this.get('analytics').trackEvent('Sign and Submit breadcrumb');
          break;
        case 'Next':
          if (this.stateIndex === 2) {
            this.get('analytics').trackEvent('Next button_Review Proposal Information_Submission');
          }
          if (this.stateIndex === 3) {
            this.get('analytics').trackEvent('Next button_Proposal Certifications_Submission');
          }
          break;
        default:
          break;
      }
    },
    setPassedComplianceCheck(passedComplianceCheck) {
      this.set('isLoading', false);
      if (passedComplianceCheck) {
        this.set('stateIndex', 1);
        // TODO: Preview Release
        if (!this.get('props').uiFeatureToggles.disableProposalSignSubmit) {
          const message = {status: 'success', dismissable: true, message: this.get('messageTexts').ready_for_submission};
          this.get('messageService').addMessage(message);
        }
      }
    },
    setHasComplianceErrors(bool) {
      this.set('hasComplianceErrors', bool);
    },
    setHasComplianceWarnings(bool) {
      this.set('hasComplianceWarnings', bool);
    },
    setProposalCertificationsComplete(isCompleted, ineligible, explanation, agreeCert) {
      this.set('proposalCertificationsComplete', isCompleted);
      this.set('ineligible', ineligible);
      this.set('explanation', explanation);
      this.set('agreeCert', agreeCert);
    },
    setNextDisabledText(text) {
      this.set('nextDisabledText', text);
    },
    signSubmit() {
      const debarFlag = (this.get('ineligible')) ? 'Y' : 'N';

      const signedObject = {
        'propPrepId': this.get('model.proposalPackageData').propPrepId,
        'propRevId': this.get('model.proposalPackageData').propRevId,
        'debarText': this.get('explanation'),
        'debarFlag': debarFlag,
        'elecSignCertAgreement': 'Y',
        'institutionId': this.get('model.proposalPackageData').institution.id
      };
      this.get('analytics').trackEvent('Sign and Submit button_Sign and Submit_Submission');

      this.set('isSubmitting', true);
      this.get('proposalService').submitProposal(signedObject).then(
        (/* data*/) => {
          const messageText = this.get('model.isPFUStatus') ? this.get('messageTexts.success_revision_submitted') : this.get('messageTexts.success_proposal_submitted');
          const message = {
            status: 'success',
            dismissable: true,
            message: messageText,
            level: this.get('messageService').LEVEL_CROSS_SCREEN,
            displayRoute: 'proposals.index'
          };
          this.get('messageService').addMessage(message);
          this.set('isSubmitted', true);
          this.transitionToRoute('proposals', 'submitted');
        },
        (data)  => {
          const message = {
            status: 'error',
            dismissable: true,
            displayType: 'noBullet',
            message: data.responseJSON.errors[0].message
          };
          this.get('messageService').addMessage(message);
        }).then(() => {
        this.set('isSubmitting', false);
      });
    },
  }

});
