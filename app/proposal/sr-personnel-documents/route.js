import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { hashSettled } from 'rsvp';
import $ from 'jquery';

export default Route.extend({

  props: service('properties'),
  activeUser: service('active-user'),
  messageService: service('messages'),
  permissions: service('permissions'),
  personnelService: service('personnel'),

  beforeModel() {
    // const proposal = this.modelFor('proposal');
    //
    // if ( (['01', '08', '13'].indexOf(proposal.proposalStatus) > -1) && !this.get('permissions').hasPermission('proposal.data.modify')) {
    //   const message = {
    //     status: 'info',
    //     dismissable: false,
    //     message: 'You currently have view only access to the proposal. This access level is controlled by the PI/co-PIs on the proposal.',
    //     level: this.get('messageService').LEVEL_SCREEN
    //   }
    //   this.get('messageService').addMessage(message);
    // }
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
    willTransition(transition) {
      this.get('messageService').clearScreenMessages();

      const transitionToRouteName = transition.targetName;

      // this regex is for testing if the transition route is a child route of the sr-personnel-document route
      var routeNameRegex = new RegExp(`^${this.routeName}(.[a-zA-Z-]+)+`);
      const isSrPersonnelRoute = routeNameRegex.test(transitionToRouteName);

      const proposalParams = transition.params.proposal;
      const { propPrepId: currentPropPrepId, propRevId: currentPropRevId } = this.modelFor('proposal');
      const currentAndTransitionProposalEqual = (proposalParams
        && currentPropPrepId === proposalParams.prop_prep_id
        && currentPropRevId === proposalParams.prop_rev_id);

      if (!isSrPersonnelRoute || !currentAndTransitionProposalEqual) {
        const indexController = this.controllerFor(`${this.routeName}.index`);
        indexController.setProperties({
          currentSort: 'role',
          currentSortOrder: 'asc',
          toggleHash: {}
        });
      }

      return true; // will call parent willTransition()
    }
  }

});
