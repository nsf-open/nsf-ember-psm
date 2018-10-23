import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';

export default Component.extend({
  PROPOSAL_CONSTANTS: service('proposal-constants'),

  fileErrorText: 'The form contains the following error(s). Please update the form and try saving again.',
  formErrorText: 'The form contains the following error(s). Please update the form and submit again.',

  formWarningText: 'Your form contains the following warning(s):',
  fileWarningText: 'Your file contains the following warning(s):',

  genericFailText: 'The system has encountered an error',


  init(...args) {
    this._super(...args);

    const { TRY_AGAIN } = this.get('PROPOSAL_CONSTANTS').SYSTEM_ERROR;

    this.set('genericHelpInstrustion', TRY_AGAIN);

    this.set('messageTexts', {
      'generic_fail_text': 'The system has encountered an error',
      'generic_help_instrustion': TRY_AGAIN,
      'form_error_text': 'The form contains the following error(s). Please update the form and submit again.',
      'file_error_text': 'The form contains the following error(s). Please update the form and try saving again.',
      'file_warning_text': 'Your file contains the following warning(s):',
      'form_warning_text': 'Your form contains the following warning(s):'
    });
  },


  fileUpload: computed('fileUploadForm', function() {
    return this.get('fileUploadForm') || false;
  }),

  formSub: computed('formSubmission', function() {
    return this.get('formSubmission') || false;
  }),

  genericErrorMessagePresent: computed('messages.[]', function() {
    const errorMessages = this.get('messages').filterBy('status', 'error').uniqBy('message');
    if ((errorMessages.length === 1 && errorMessages[0].message.indexOf(this.get('genericFailText')) >= 0) || (errorMessages[0].displayType && errorMessages[0].displayType === 'noBullet')) {
      return true;
    }
    else {
      return false;
    }
  }),

  successMessages: computed('messages.[]', function() {
    return (undefined !== this.get('messages')) ? this.get('messages').filterBy('status', 'success').uniqBy('message') : [];
  }),

  // infoMessages: computed('messages.[]', function() {
  //   return ( undefined !== this.get('messages') ) ? this.get('messages').filterBy('status', "info").uniqBy('message') : [];
  // }),

  dismissableInfoMessages: computed('messages.[]', function() {
    return (undefined !== this.get('messages')) ? this.get('messages').filterBy('status', 'info').filterBy('dismissable', true).uniqBy('message') : [];
  }),

  notDismissableInfoMessages: computed('messages.[]', function() {
    return (undefined !== this.get('messages')) ? this.get('messages').filterBy('status', 'info').filterBy('dismissable', false).uniqBy('message') : [];
  }),

  dismissableWarningMessages: computed('messages.[]', function() {
    return (undefined !== this.get('messages')) ? this.get('messages').filterBy('status', 'warning').filterBy('dismissable', true).uniqBy('message') : [];
  }),
  notDismissableWarningMessages: computed('messages.[]', function() {
    return (undefined !== this.get('messages')) ? this.get('messages').filterBy('status', 'warning').filterBy('dismissable', false).uniqBy('message') : [];
  }),

  dismissableErrorMessages: computed('messages.[]', function() {
    return (undefined !== this.get('messages')) ? this.get('messages').filterBy('status', 'error').filterBy('dismissable', true).uniqBy('message') : [];
  }),
  notDismissableErrorMessages: computed('messages.[]', function() {
    return (undefined !== this.get('messages')) ? this.get('messages').filterBy('status', 'error').filterBy('dismissable', false).uniqBy('message') : [];
  })


});
