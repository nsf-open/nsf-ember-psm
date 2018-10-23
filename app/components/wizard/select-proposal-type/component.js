import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';

export default Component.extend({

  props: service('properties'),
  activeUser: service('active-user'),
  proposalService: service('proposal'),

  proposalTypes: computed(function() {
    return [];
  }),

  nextDisabledTitleText: 'A selection must be made before you can proceed.',

  originalPT: null,

  nextDisabled: computed('wizard.proposalType', function() {
    if (this.get('wizard.proposalType') !== undefined && this.get('wizard.proposalType') !== null) {
      return false;
    }
    return true;
  }),

  nextDisabledTitle: computed('wizard.proposalType', function() {
    if (this.get('wizard.proposalType') !== undefined && this.get('wizard.proposalType') !== null) {
      return '';
    }
    return this.get('nextDisabledTitleText');
  }),

  proposalTypeInfoText: 'A proposal may be associated with one of several NSF proposal types and instructions are generally provided in the funding opportunity. Please refer to the Proposal & Award Polices & Procedures Guide (PAPPG) for further information about these proposal types.',

  willInsertElement() {
    this.set('originalPT', this.get('wizard').get('proposalType'));
    const enabledOptions = this.get('props').get('uiFeatureToggles.proposalTypesEnabled');
    const disabledTextDefault = this.get('props').get('uiFeatureToggles.disabledTextDefault');
    if (enabledOptions != null) {
      this.set('enabledOptions', enabledOptions);
    }
    if (disabledTextDefault != null) {
      this.set('disabledTextDefault', disabledTextDefault);
    }

    this.get('proposalService').getProposalTypes().then((response) => {
      const propTypeLookups = response.proposalTypeLookUps;
      if (propTypeLookups != null && propTypeLookups.length > 0) {
        const newOptions = [];
        let i = 0;
        let j = 0;
        let val = '';
        propTypeLookups.forEach((option) => {
          option.disabled = true;
          this.get('enabledOptions').forEach((code) => {
            if (option.code === code) {
              option.disabled = false;
              val = code;
              j += 1;
            }
          });
          if (option.disabled === true) {
            option.title = this.get('disabledTextDefault');
            option.disabledClass = 'rbContainerDisabled';
          }
          else {
            option.title = option.description;
          }
          newOptions[i] = option;
          i += 1;
        });
        if (j > 0 && j < 2) {
          this.set('nextDisabled', false);
          this.set('wizard.proposalType', val);
        }
        this.set('proposalTypes', newOptions);
      }
    });
  },

  actions: {
    previous() {
      this.get('previous')();
    },
    next() {
      this.get('next')();
    },
    setProposalType(proposalType) {
      if (proposalType !== this.get('originalPT')) {
        const wizard = this.get('wizard');
        wizard.set('submissionType', null);
        wizard.set('collaborationType', null);
        wizard.set('leadProposal', null);
        wizard.set('proposalTitle', '');
      }
    }
  }

});
