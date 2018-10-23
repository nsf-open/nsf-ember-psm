import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import { isEmpty } from '@ember/utils';
import $ from 'jquery';

const nameAllowableCharactersPattern = /^([a-zA-Z\d?:;"*,\\/+#().!@#$%&\- ])*$/;

export default Component.extend({
  activeUser: service('active-user'),
  analytics: service('webtrend-analytics'),
  proposalService: service('proposal'),
  props: service('properties'),

  maxCharLength: 180,
  prepareButtonClicked: false,
  prepareProposalDisabledTitleText: 'All questions must be answered before you can proceed.',

  init() {
    this._super(...arguments);
    this.whatIsCollab = {
      title: 'What is a Collaborative Proposal?',
      linkText: 'What is a collaborative proposal?'
    };

    this.collaborativeProposal = {
      titleText: `${this.whatIsCollab.title} <button type="button" class="close" data-dismiss="popover" aria-label="Close"><span aria-hidden="true">&times;</span></button>`,
      infoText: `<p>NSF supports two kinds of collaborative proposals, which involve investigators from two or more organizations who wish to collaborate on a unified research project.  If a proposal includes researchers from a single organization, it is not considered a collaborative proposal.</p> <p>View <a href="${
        this.get('props').pappgLinks.collaborativeProposal}" target="_blank">PAPPG II.D.3 <i class="fa fa-external-link" title="Opens new window" aria-hidden="true"></i></a> for more information.</p>`
    },

    this.messageTexts = {
      'overCharacterLimit': 'Proposal Title cannot exceed 180 characters',
      'illegalSpecialCharacters': 'Proposal Title cannot include this special character',
      'specialCharacterDisplayError': 'A special character did not display properly. Please try typing it in directly.'
    }
  },

  proposalCollaborativeTitle: 'Proposal Details',

  showLeadPrompt: computed('wizard.collaborationType', function() {
    const collabType = this.get('wizard').get('collaborationType');
    if (collabType === 'separately') {
      return true;
    }
    else {
      this.get('wizard').set('leadProposal', null);
      return false;
    }
  }),

  characterCount: computed('wizard.proposalTitle', function() {
    const title = this.get('wizard.proposalTitle');
    return (title) ? title.length : 0;
  }),
  proposalTitleContentError: computed('wizard.proposalTitle', function() {
    const title = this.get('wizard.proposalTitle');

    if (this.get('characterCount') > this.get('maxCharLength')) {
      return this.get('messageTexts').overCharacterLimit;
    }
    else if (!nameAllowableCharactersPattern.test(title)) {
      return this.get('messageTexts').illegalSpecialCharacters;
    }
    else {
      return null;
    }
  }),

  prepareProposalDisabled: computed('wizard.{collaborationType,leadProposal}', 'characterCount', 'proposalTitleContentError', 'prepareButtonClicked', function() {
    const enabled = false;

    if (this.get('prepareButtonClicked')) {
      return !enabled;
    }

    const wizard = this.get('wizard');
    const collabType = wizard.get('collaborationType');
    const titleError = this.get('proposalTitleContentError');
    const characterCount = this.get('characterCount');
    if (characterCount !== 0 && isEmpty(titleError) && collabType !== undefined && collabType !== null) {
      if (collabType === 'separately' && wizard.get('leadProposal') === null) {
        return !enabled;
      }
      return enabled;
    }
    return !enabled;
  }),

  didInsertElement() {
    const enabledOptions = this.get('props').get('uiFeatureToggles.collaborativeOptionsEnabled');
    const disabledTextDefault = this.get('props').get('uiFeatureToggles.disabledTextDefault');

    if (enabledOptions != null && enabledOptions.length > 0) {
      $('.response-radio').find('li').each(function() {
        const li = $(this);
        $(this).find('label').each(function() {
          const label = $(this);
          $(this).find('input').each(function() {
            const option = $(this);
            option.attr('disabled', true);
            enabledOptions.forEach(function(value) {
              if (option.attr('name') === value) {
                // if (option.attr('value') === value) {
                option.attr('disabled', false);
                li.attr('title', label.find('span').text());
              }
            });
            if (option.attr('disabled') !== undefined) {
              if (option.attr('disabled') === 'disabled') {
                li.attr('title', disabledTextDefault);
                label.find('span').attr('class', `${label.attr('class')} disabled`);
              }
            }
          });
        });
      });
    }
  },

  didRender() {
    const component = this;
    let i = 0;
    let option = null;
    $('.ember-radio-button').find('input').each(function() {
      if (!$(this).is(':disabled')) {
        option = $(this);
        i += 1;
      }
    });
    if (i > 0 && i < 2) {
      option.prop('checked', true);
      // component.set('wizard.collaborationType', option.attr('value'));
      component.set('wizard.collaborationType', option.attr('name'));
    }
  },

  disableControls: computed(function() {
    alert($('.response-radio').find('li').length);
  }),

  willDestroyElement() {
    this._super(...arguments);
    $('input:text').unbind('paste');
  },

  actions: {
    previous() {
      this.get('previous')();
    },

    clear() {
      this.set('wizard.proposalTitle', null);
    },
    trimInput(string) {
      this.set('wizard.proposalTitle', string.trim());
    },


    prepare() {
      this.set('prepareButtonClicked', true);
      this.get('analytics').trackEvent('Prepare Proposal button_ Proposal Information');
      let currentUser = this.get('activeUser').getCurrentUser();
      if (currentUser && currentUser.UserData) {
        currentUser = currentUser.UserData;
      }

      if (!window.Psm) {
        window.Psm = {};
      }

      window.Psm.institutionID = currentUser.institutionRoles[0].institution.id;

      const component = this;
      const wizard = this.get('wizard');

      const tempPI = {
        nsfId: currentUser.nsfId,
        institution: {
          id: currentUser.institutionRoles[0].institution.id
        },
        firstName: currentUser.firstName,
        middleName: currentUser.middleInitial,
        lastName: currentUser.lastName
      };

      let collabType = wizard.get('collaborationType');
      if (collabType === 'separately') {
        collabType = wizard.get('leadProposal');
      }

      const newProposalData = {
        fundingOp: wizard.fundingOp,
        proposalTitle: wizard.proposalTitle.trim(),
        proposalType: wizard.proposalType,
        submissionType: wizard.submissionType,
        collabType: collabType,
        uocs: wizard.uocs,
        pi: tempPI
      };

      this.get('proposalService').createProposal(newProposalData).then((data) => {
        component.sendAction('created', data.proposalPackage);
      }, () => {
        component.sendAction('error');
      });
    }
  }
});
