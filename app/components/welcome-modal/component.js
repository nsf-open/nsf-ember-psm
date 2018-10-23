import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { getOwner } from '@ember/application';
import $ from 'jquery';

export default Component.extend({

  messageService: service('messages'),

  showNewPSMWelcomeModal: true,

  didInsertElement() {
    this._super(...arguments);

    const currentRoute = getOwner(this).lookup('router:main').get('currentRouteName');
    const self = this;
    $(document).ready(function() {
      if (currentRoute !== 'release-timeline') {
        if (self.get('showNewPSMWelcomeModal')) {
          $('<div id="newPSMWelcomeModalBackdrop" class="modal-backdrop in"></div>').appendTo(document.body);
          $('#newPSMWelcomeModal').show();
        }
      }
    });
  },

  actions: {
    closeWelcomeModal() {
      $('#newPSMWelcomeModalBackdrop').remove();
      $('#newPSMWelcomeModal').hide();
      this.set('showNewPSMWelcomeModal', false);
    },
    openReleaseTimeline() {
      window.open('./#/release-timeline');
    }
  }

});
