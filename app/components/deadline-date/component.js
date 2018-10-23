import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { alias } from '@ember/object/computed';
import { computed } from '@ember/object';
import { isEmpty } from '@ember/utils';
import { htmlSafe } from '@ember/string';
import $ from 'jquery';
/* global moment */

export default Component.extend({
  props: service('properties'),
  PROPOSAL_CONSTANTS: service('proposal-constants'),
  activeUser: service('active-user'),
  propPrepId: alias('model.propPrepId'),
  propRevId: alias('model.propRevId'),
  deadlineDate: alias('model.deadlineDate'),
  lookups: service('lookups'),
  messageService: service('messages'),
  editing: false,
  saveButtonErrorTitle: 'You must select a due date to save',

  init(...args) {
    this._super(...args);

    this.messageTexts = {
      'no_available_due_dates': 'All due dates for this funding opportunity have passed and none are scheduled in the next 12 months; therefore, this proposal cannot be submitted.',
      'fail_generic': this.get('PROPOSAL_CONSTANTS').SYSTEM_ERROR.DEADLINE_DATE,
      'success_generic': 'The Due Date has been updated successfully.'
    };
  },

  didReceiveAttrs() {
    this._super(...arguments);
    this.set('componentId', this.elementId);

    this.set('originalModel', this.get('model'))
    this.set('editing', false);
    this.send('setDeadlineDates');
  },


  didInsertElement(...args) {
    this._super(...args);
    const componentElement = $(`#${this.element.id}`);

    const self = this;

    $(document.body).on(`click.${this.element.id} focusin.${this.element.id}`, function(event) {
      if (self.get('editing')) {
        const isOutOfComponent = !$.contains($(componentElement).get(0), event.target);
        const wasInComponent = event.target.id.includes(`${self.element.id}-`);

        if (isOutOfComponent && !wasInComponent) {
          self.send('cancel');
        }
      }
    });
  },

  willDestroyElement() {
    $(document).off(`click.${this.element.id} focusin.${this.element.id}`);
    this._super(...arguments);
  },

  isAcceptedAnytime: computed('model.deadlineTypeCode', function() {
    const deadlineTypeCode = this.get('model.deadlineTypeCode');
    if (deadlineTypeCode === '3') {
      return true;
    }
    return false;
  }),

  /**
   * If more than one date option, show as required
   */
  deadlineDateRequired: computed('model', 'deadlineDateOptions', function() {
    const deadlineDateOptions = this.get('deadlineDateOptions');
    if (deadlineDateOptions && deadlineDateOptions.length > 1) {
      return true;
    }
    return false;
  }),

  deadlineType: computed('model.deadlineTypeDesc', 'deadlineDateOptions', function() {
    const typeDesc = this.get('model.deadlineTypeDesc');
    const deadlineDateOptions = this.get('deadlineDateOptions');

    if (typeDesc) {
      return typeDesc;
    }
    else if (!typeDesc && deadlineDateOptions && !isEmpty(deadlineDateOptions)) {
      const deadlineDateOptionsTypes = deadlineDateOptions.uniqBy('deadlineTypeCode');

      if (deadlineDateOptionsTypes.length > 1) {
        return 'Determined by due date';
      }
      else {
        return deadlineDateOptionsTypes[0].deadlineTypeDesc;
      }
    }
    else { return ''; }
  }),

  deadlineDateReadonly: computed('model.deadlineDate', 'deadlineDateOptions', 'isAcceptedAnytime', function() {
    const deadlineDateOptions = this.get('deadlineDateOptions');
    const deadlineDate = this.get('model').deadlineDate;

    // Accepted Anytime then date will be read only
    if (this.get('isAcceptedAnytime')) {
      return true;
    }
    // If there is a deadlineDate already set and there is only 1 option, then readonly
    if (deadlineDate && deadlineDateOptions && deadlineDateOptions.length === 1) {
      return true;
    }
    // If there are no dropdown options available, then readonly
    if (isEmpty(deadlineDateOptions)) {
      return true;
    }
    return false;
  }),

  deadlineDateUnavailable: computed('model.deadlineDate', 'deadlineDateOptions', 'isAcceptedAnytime', function() {
    const deadlineDateOptions = this.get('deadlineDateOptions');
    const deadlineDate = this.get('deadlineDate');
    if (isEmpty(deadlineDateOptions) && !deadlineDate && !this.get('isAcceptedAnytime')) {
      return htmlSafe('No dates available <span style="font-size: 14px;">(cannot submit)</span>');
    }
    return '';
  }),


  saveIsDisabled: computed('selectedDate', function() {
    if (isEmpty(this.get('selectedDate'))) {
      return true;
    }
    return false
  }),

  actions: {
    selectDeadlineDate(newDate) {
      this.set('selectedDate', newDate);
    },
    setDeadlineDates() {
      const deadlineDates = this.get('deadlineDates');

      if (!isEmpty(deadlineDates)) {
        this.set('deadlineDateOptions', deadlineDates);

        const singleType = deadlineDates.uniqBy('deadlineTypeCode').length === 1;

        if (singleType) {
          this.set('model.deadlineTypeCode', deadlineDates[0].deadlineTypeCode);
          this.set('model.deadlineTypeDesc', deadlineDates[0].deadlineTypeDesc);
        }

        if (deadlineDates.length === 1 && !this.get('deadlineDate') && deadlineDates[0].deadlineTypeCode !== '3') {
          this.send('save', deadlineDates[0].deadlineDate);
        }
      }
    },

    enterEdit() {
      this.set('selectedDate', this.get('deadlineDate'));
      this.set('editing', true);
      this.get('messageService').clearActionMessages();
    },

    exitEdit() {
      this.set('editing', false);
    },

    save(saveDate) {
      // also do a set on the deadlineDate or the model
      this.set('editing', false);
      this.get('messageService').clearActionMessages();

      const selectedDate = (saveDate) || this.get('selectedDate');
      const showMessages = !(saveDate);

      const newDeadlineTypeCode = this.get('deadlineDateOptions').findBy('deadlineDate', parseInt(selectedDate, 10)).deadlineTypeCode;
      const newDeadlineTypeDesc = this.get('deadlineDateOptions').findBy('deadlineDate', parseInt(selectedDate, 10)).deadlineTypeDesc;

      const dataToSend = {
        'propPrepId': this.get('propPrepId'),
        'propRevId': this.get('propRevId'),
        'deadline': {
          'deadlineDate': parseInt(selectedDate, 10),
          'deadlineTypeCode': newDeadlineTypeCode
        }
      };

      this.get('proposalService').updateProposal(dataToSend).then(() => {
          if (showMessages) {
            const message = {status: 'success', dismissable: true, message: this.get('messageTexts.success_generic')};
            this.get('messageService').addMessage(message);
          }
          this.set('model.deadlineDate', parseInt(selectedDate, 10));
          this.set('model.deadlineTypeCode', newDeadlineTypeCode);
          this.set('model.deadlineTypeDesc', newDeadlineTypeDesc);

          const deadlineModel = {
            deadlineTypeDesc: newDeadlineTypeDesc,
            deadlineDate: parseInt(selectedDate, 10),
            deadlineTypeCode: newDeadlineTypeCode
          }
          this.get('updateDeadline')(deadlineModel);

          this.send('exitEdit');
        }, () => {
          if (showMessages) {
            const message = {status: 'error', dismissable: false, message: this.get('messageTexts.fail_generic')};
            this.get('messageService').addMessage(message);
          }
          this.send('exitEdit');
        });
    },

    cancel() {
      // also do a revert of data if necessary.
      this.send('exitEdit');
    }
  }

});
