import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { hashSettled } from 'rsvp';
import $ from 'jquery';

export default Route.extend({
  activeUser: service('active-user'),
  messageService: service('messages'),
  permissions: service('permissions'),
  personnelService: service('personnel'),
  props: service('properties'),

  beforeModel() {
    const proposal = this.modelFor('proposal');

    if ((['01', '08'].indexOf(proposal.proposalStatus) > -1) && !this.get('permissions').hasPermission('proposal.personnel.add')) {
      const message = {
        status: 'info',
        dismissable: false,
        message: 'You currently have view only access to the proposal. This access level is controlled by the PI/co-PIs on the proposal.',
        level: this.get('messageService').LEVEL_SCREEN
      }
      this.get('messageService').addMessage(message);
    }
    return this.get('props').load();
  },

  // initial load of the model
  model() {
    const proposal = this.modelFor('proposal');
    return hashSettled({
      lookupSrPerson: this.get('personnelService').getSeniorPersonnelRoles(),
      lookupOtherPerson: this.get('personnelService').getOtherPersonnelRoles()
    }).then((hash) => {
      hash.propPrepId = proposal.propPrepId;
      hash.propRevId = proposal.propRevId;
      hash.proposalStatus = proposal.proposalStatus;
      return hash;
    });
  },

  setupController(controller, models) {
    this._super(controller, models);
    controller.setProperties(models);
    controller.reInit();
  },

  activate () {
    window.scrollTo(0, 0);

    // Stripe rows appropriately
    $(document).ready(function() {
      $('.table').each(function() {
        $('tr.primary-row:odd').addClass('row-odd');
        $('tr.secondary-row:odd').addClass('row-odd');
      });
    });
  },

  actions: {
    willTransition() {
      $('input').off('keydown', '**');
      $('input').unbind('paste');
      // Reset to default sorts when leaving route
      this.controller.set('currentSort', 'role');
      this.controller.set('currentSortOrder', 'asc');
      this.controller.set('currentSortOAU', 'name');
      this.controller.set('currentSortOrderOAU', 'asc');
      this.get('messageService').clearScreenMessages();

      return true; // will call parent willTransition()
    }
  }
});
