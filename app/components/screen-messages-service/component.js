import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import { alias } from '@ember/object/computed';
import { getOwner } from '@ember/application';

export default Component.extend({

  messageService: service('messages'),
  messages: alias('messageService.messages'),

  fileErrorText: 'Your file contains the following error(s). Please update your file and try uploading it again.',
  formErrorText: 'The form contains the following error(s). Please update the form and try submitting again.',

  formWarningText: 'Your form contains the following warning(s):',
  fileWarningText: 'Your file contains the following warning(s):',

  genericFailText: 'The system has encountered an error',

  multipleInfoMessagesText: 'Please note the following:',

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

  dismissableSuccessMessages: computed('messages.[]', function() {
    return (undefined !== this.get('messages')) ? this.get('messages').filterBy('status', 'success').filterBy('dismissable', true).uniqBy('message') : [];
  }),
  notDismissableSuccessMessages: computed('messages.[]', function() {
    return (undefined !== this.get('messages')) ? this.get('messages').filterBy('status', 'success').filterBy('dismissable', false).uniqBy('message') : [];
  }),

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
    if (undefined === this.get('messages')) {
      return [];
    }

    // if there is no displayRoute or if the displayRoute is the currentRoute, show it
    const currentRoute = getOwner(this).lookup('router:main').get('currentRouteName');
    const messages = this.get('messages').filter(message => (message.displayRoute === currentRoute || message.displayRoute === ''));

    return messages.filterBy('status', 'error').filterBy('dismissable', false).uniqBy('message');
  }),

  actions: {
    clearDismissableMessages(status) {
      this.get('messageService').clearDismissableMessagesByStatus(status);
    }
  }


});
