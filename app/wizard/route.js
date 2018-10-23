import Route from '@ember/routing/route';
import Object from '@ember/object';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import { hash } from 'rsvp';
import { htmlSafe } from '@ember/string';

export default Route.extend({
  activeUser: service('active-user'),
  fundingOpportunitiesService: service('funding-opportunities'),
  messageService: service('messages'),
  permissions: service('permissions'),
  props: service('properties'),

  messageTexts: computed('props', function() {
    return {
      'info_availableFundingOps': `Select funding opportunities are not yet available in this system. If you do not see your funding opportunity, please check in <a id='fastlane-funding-opportunity' href='${this.get('props.fastLaneLinks.availableFundingOps')}' target='_blank'>FastLane</a>.`
    };
  }),

  beforeModel() {
    if (!this.get('permissions').hasInstitutionRole('PI')) {
      return this.transitionTo('proposal-prep');
      // TODO: Add a error message explaining this user does not have permission to prepare proposals
    }
    if (this.get('props').uiFeatureToggles.disableCreateProposal) {
      return this.transitionTo('proposal-prep');
    }
    return this.get('props').load();
  },

  activate () {
    window.scrollTo(0, 0);
  },

  // initial load of the model
  model() {
    const wizard = Object.create({});
    return hash({
      wizard,
      fundingOps: this.get('fundingOpportunitiesService').getFundingOpportunities().then((fundingOpportunities) => {
        const message = {status: 'info', dismissable: false, message: htmlSafe(this.get('messageTexts').info_availableFundingOps), level: this.get('messageService').LEVEL_SCREEN};
        this.get('messageService').addMessage(message);

        return fundingOpportunities;
      })
    });
  },
  setupController(controller, model) {
    this._super(controller, model);
    this.controller.set('stateIndex', 0);
  },

  actions: {
    loading(transition) {
      const controller = this.controllerFor('wizard');
      controller.set('currentlyLoading', true);
      transition.promise.finally(function() {
        controller.set('currentlyLoading', false);
      });
    },
    willTransition() {
      this.get('messageService').clearScreenMessages();
      return true;
    }
  }

});
