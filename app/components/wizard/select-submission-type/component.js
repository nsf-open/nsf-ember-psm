import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';

export default Component.extend({
  activeUser: service('active-user'),
  proposalService: service('proposal'),
  props: service('properties'),

  submissionTypes: computed(function() {
    return [];
  }),

  nextDisabledTitleText: 'A selection must be made before you can proceed.',

  originalST: null,
  // submissionType: null,

  nextDisabled: computed('wizard.submissionType', function() {
    if (this.get('wizard.submissionType') !== undefined && this.get('wizard.submissionType') !== null) {
      return false;
    }
    return true;
  }),

  nextDisabledTitle: computed('wizard.submissionType', function() {
    if (this.get('wizard.submissionType') !== undefined && this.get('wizard.submissionType') !== null) {
      return '';
    }
    return this.get('nextDisabledTitleText');
  }),

  willInsertElement() {
    this.set('originalST', this.get('wizard').get('submissionType'));
    const enabledOptions = this.get('props').get('uiFeatureToggles.submissionTypesEnabled');
    const disabledTextDefault = this.get('props').get('uiFeatureToggles.disabledTextDefault');
    if (enabledOptions != null) {
      this.set('enabledOptions', enabledOptions);
    }
    if (disabledTextDefault != null) {
      this.set('disabledTextDefault', disabledTextDefault);
    }

    this.get('proposalService').getSubmissionTypes().then((response) => {
      const submTypeLookups = response.submissionTypeLookUps;
      if (submTypeLookups != null && submTypeLookups.length > 0) {
        const newOptions = [];
        let i = 0;
        let j = 0;
        let val = '';
        submTypeLookups.forEach((option) => {
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
          this.set('wizard.submissionType', val);
        }
        this.set('submissionTypes', newOptions);
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
    setSubmissionType(submissionType) {
      if (submissionType !== this.get('originalST')) {
        const wizard = this.get('wizard');
        wizard.set('collaborationType', null);
        wizard.set('leadProposal', null);
        wizard.set('proposalTitle', '');
      }
    }
  }

});
