import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { hash } from 'rsvp';
import { hashSettled } from 'rsvp';
import $ from 'jquery';

export default Route.extend({
  messageService: service('messages'),
  proposalService: service('proposal'),
  props: service('properties'),
  analytics: service('webtrend-analytics'),
  PROPOSAL_CONSTANTS: service('proposal-constants'),

  beforeModel() {
    return this.get('props').load();
  },

  activate() {
    window.scrollTo(0, 0);

    const self = this;
    const checkExist = setInterval(function() {
      if ($('#fastlane-ram-inprogress').length) {
        $('#fastlane-ram-inprogress').on('click', function() {
          self.send('clickFastLaneLink', 'in-progress');
        });
        clearInterval(checkExist);
      }
    }, 100);

    const checkExist2 = setInterval(function() {
      if ($('#fastlane-ram-submitted').length) {
        $('#fastlane-ram-submitted').on('click', function() {
          self.send('clickFastLaneLink', 'submitted');
        });
        clearInterval(checkExist2);
      }
    }, 100);
  },

  model(params, transition) {
    const {
      proposals_type: proposalsType
    } = this.paramsFor('proposals');
    const self = this;

    if (this.get('props').uiFeatureToggles.disableViewSubmittedProposals &&
      transition.params.proposals.proposals_type === 'submitted') {
      this.transitionTo('proposal-prep');
    }

    if (proposalsType === 'inprogress') {
      return hash({
        proposalsType: 'inprogress',
        proposals: this.get('proposalService').getInProgressProposals()
      });
    }
    else if (proposalsType === 'submitted') {
      return hashSettled({
        proposalsType: 'submitted',
        proposals: this.get('proposalService').getSubmittedProposals()
      }).then((hash) => {
        if (hash.proposals.state === 'fulfilled') {
          hash.proposals = hash.proposals.value;
          hash.proposalsType = hash.proposalsType.value;
        }
        else if (hash.proposals.state === 'rejected') {
          // error messaging here
          hash.proposals = [];
          hash.proposalsType = hash.proposalsType.value;
          const message = {
            status: 'error',
            dismissable: false,
            message: self.get('messageTexts').fail_generic
          };
          self.get('messageService').addMessage(message);
        }
        return hash;
      });
    }
  },

  init(...args) {
    this._super(...args);

    this.set('messageTexts', {
      'fail_generic': this.get('PROPOSAL_CONSTANTS').SYSTEM_ERROR.ENCOUNTERED,
    });
  },

  setupController(controller, models) {
    this._super(controller, models);
    controller.setProperties(models);
  },

  actions: {
    willTransition() {
      this.get('messageService').clearScreenMessages();
      return true;
    },
    clickFastLaneLink(type) {
      this.get('analytics').trackEvent(`FastLane RAM Module link_${type} proposals page`);
    }
  }

});
