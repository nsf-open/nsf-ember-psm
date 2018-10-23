import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { alias } from '@ember/object/computed';
import { computed } from '@ember/object';
import $ from 'jquery';

const nameAllowableCharactersPattern = /^([a-zA-Z\d?:;"*,\\/+#().!@#$%&\- ])*$/;

const InlineEditComponent = Component.extend({

  props: service('properties'),
  activeUser: service('active-user'),

  tagName: 'section',
  classNames: ['inline-edit'],

  propPrepId: alias('model.propPrepId'),
  propRevId: alias('model.propRevId'),

  messageTexts: computed('fieldName', function() {
    return {
      'overCharacterLimit': `${this.get('fieldName')} cannot exceed ${this.get('maxCharLength')} characters`,
      'illegalSpecialCharacters': `${this.get('fieldName')} cannot include this special character`,
      'specialCharacterDisplayError': 'A special character did not display properly. Plesase try typing it in directly.'
    };
  }),

  didReceiveAttrs() {
    this._super(...arguments);
    const originalValue = this.get('originalValue');
    const prevOriginalValue = this.get('prevOriginalValue');

    this.set('componentId', this.elementId);
    if (originalValue !== prevOriginalValue) {
      this.set('displayValue', originalValue);
      this.resetCharacterCount();
    }

    this.set('prevOriginalValue', originalValue);
    this.set('editIconInstruction', `Click to edit ${this.get('fieldName').toLowerCase()}`);
  },

  didInsertElement() {
    this._super(...arguments);
    const inlineEdit = $(`#${this.element.id}`);
    this.set('inlineEdit', inlineEdit);

    const self = this;

    $(document.body).on(`click.${this.element.id} focusin.${this.element.id}`, function(event) {
      if (self.get('isEditing')) {
        // IE fix for first calling a focusin event on the body (which would otherwise cancel and remove the x icon)
        if (event.target.nodeName === 'BODY' && event.type === 'focusin') {
          return;
        }

        const isOutOfComponent = !$.contains($(inlineEdit).get(0), event.target);
        const wasInComponent = event.target.id.includes(`${self.element.id}-`);

        if ((isOutOfComponent && !wasInComponent) || (!isOutOfComponent && wasInComponent)) {
          self.send('cancel');
        }
      }
    });
  },

  willDestroyElement() {
    $(document).off(`click.${this.element.id} focusin.${this.element.id}`);
    this._super(...arguments);
  },

  resetCharacterCount() {
    const displayValue = this.get('displayValue');
    this.set('characterCount', (displayValue) ? displayValue.length : 0);
  },

  saveIsDisabled: computed('contentError', 'characterCount', function() {
    if (this.get('characterCount') === 0 || this.get('characterCount') > this.get('maxCharLength') || this.get('contentError')) {
      return true;
    }
    return false;
  }),

  saveButtonErrorTitle: computed('saveIsDisabled', function() {
    if (this.get('characterCount') === 0) {
      return 'Enter at least 1 character to save';
    }
    else if (this.get('saveIsDisabled')) {
      return 'Error must be fixed before saving';
    }
    return '';
  }),

  actions: {

    enterEdit(event) {
      if (event.type !== 'click' && event.keyCode !== 13) {
        return false;
      }

      this.get('onEditing')(true);

      const self = this;
      const checkExist = setInterval(function() {
        const input = self.get('inlineEdit').find('input');
        if (input.is(':visible')) {
          input.focus();
          input.get(0).selectionStart = input.get(0).selectionEnd = self.get('displayValue').length;
          clearInterval(checkExist);
        }
      }, 100);
    },

    clear() { // set disaply value to null
      this.set('displayValue', null);
    },

    cancel() { // replace with original value
      this.set('displayValue', this.get('originalValue'));
      this.set('contentError', null);
      this.resetCharacterCount();

      this.get('onEditing')(false);
    },

    save() { // if not empty, save, if empty- replace with orignal value
      const displayValue = this.get('displayValue');
      this.get('onSave')(displayValue);
    },

    trimInput(string) {
      this.set('displayValue', string.trim());
    },

    valueChange() {
      const displayValue = this.get('displayValue');
      this.resetCharacterCount();

      let contentErrorValue = null;
      if (this.get('characterCount') > this.get('maxCharLength')) {
        contentErrorValue = this.get('messageTexts').overCharacterLimit;
      }
      else if (!nameAllowableCharactersPattern.test(displayValue)) {
        contentErrorValue = this.get('messageTexts').illegalSpecialCharacters;
      }
      this.set('contentError', contentErrorValue);
    }

  }
});


InlineEditComponent.reopenClass({
  positionalParams: ['fieldName', 'model', 'maxCharLength']
});

export default InlineEditComponent;
