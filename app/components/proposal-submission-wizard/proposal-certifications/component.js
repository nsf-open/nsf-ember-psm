import Component from '@ember/component';
import { isEmpty } from '@ember/utils';
import { computed } from '@ember/object';

const nameAllowableCharactersPattern = /^([a-zA-Z\d?:;"*,\\/+#().!@#$%&\- ])*$/;
export default Component.extend({

  maxCharLength: 45,

  init() {
    this._super(...arguments);
    this.messageTexts = {
      'over_character_limit': 'Explanation must be 45 characters or less',
      'illegal_special_characters': 'Explanation cannot include this special character',
      'next_disabled_title_text': 'All required fields must be entered before proceeding.',
      'explanation_missing': 'An explanation is required when \'Yes\' is selected. Please enter your explanation, then click \'Next\' to proceed.'
    }
  },

  characterCount: computed('explanation', function() {
    const explanation = this.get('explanation');

    if (explanation && explanation.length > 0) {
      this.set('ineligible', true);
      return explanation.length;
    }

    return 0;
  }),
  explanationContentError: computed('explanation', 'ineligible', function() {
    const explanation = this.get('explanation');

    if (this.get('characterCount') > this.get('maxCharLength')) {
      return this.get('messageTexts').over_character_limit;
    }
    else if (!nameAllowableCharactersPattern.test(explanation)) {
      return this.get('messageTexts').illegal_special_characters;
    }
    else {
      return null;
    }
  }),

  secondScreenComplete() {
    const explanationContentError = this.get('explanationContentError');
    const ineligible = this.get('ineligible');
    if (this.get('agreeCert') && !isEmpty(ineligible) && (!ineligible || (ineligible && this.get('explanation') && isEmpty(explanationContentError)))) {
      this.get('setProposalCertificationsComplete')( true, ineligible, this.get('explanation'), this.get('agreeCert'));
    }
    else {
      this.get('setProposalCertificationsComplete')( false, ineligible, this.get('explanation'), this.get('agreeCert'));
    }
  },

  actions: {
    trimInput(string) {
      this.set('explanation', string.trim());
    },
    changeCert(event) {
      if (event && event.target && event.target.checked) {
        this.set('agreeCert', true);
      }
      else this.set('agreeCert', false);
      this.secondScreenComplete();
    },
    screenChange() {
      if (!this.get('ineligible')) { // remove errors on explanation if principal is eligible
        this.set('explanation', '');
      }
      this.secondScreenComplete();
    }

  }

});
