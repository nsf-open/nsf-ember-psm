import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import { alias } from '@ember/object/computed';
import $ from 'jquery';

// import { updateNavByLinkName } from './util/update-proposal-nav';

export default Controller.extend({
  analytics: service('webtrend-analytics'),
  pageInfo: service('page-info'),
  sectionLookup: service('section-lookup'),
  transitionService: service('transition'),

  showMenu: true,

  breadCrumb: computed('model.propPrepId', {
    get() {
      const proposalStatus = this.get('model').proposalStatus;
      if (proposalStatus === '07' || proposalStatus === '08' || proposalStatus === '09'
        || proposalStatus === '10' || proposalStatus === '11' || proposalStatus === '12'
        || proposalStatus === '13' || proposalStatus === '14' || proposalStatus === '15' || proposalStatus === '16') {
        return 'Proposal File Update/Budget Revision';
      }

      const propPrepId = (this.get('model.nsfPropId') ? this.get('model.nsfPropId') : this.get('model.propPrepId'));
      let retVal = `Proposal - ${propPrepId}`;

      if (!this.get('permissions').hasPermission('proposal.data.modify')) {
        if (this.get('model').proposalStatus === '01' || this.get('model').proposalStatus === '08' || this.get('model').proposalStatus === '13') {
          retVal += ' (View Only)';
        }
      }
      return retVal;
    }

  }),

  breadCrumbModel: alias('model'),

  props: service('properties'),
  activeUser: service('active-user'),
  permissions: service('permissions'),

  init() {
    this._super(...arguments);
    this.get('props').load();
    this.abortCurrentTransition = function() {
      this.get('transitionService').abortResetLoadingTransition();
    }.bind(this);
    window.addEventListener('popstate', this.abortCurrentTransition);
    this.breadCrumbs = [
      {label: 'My Desktop', action: 'exitToMyDesktop'},
      {label: 'Proposal Preparation', path: 'proposal-prep'}
    ],

    this.messageTexts = {
      'proposal_reload_fail': 'Proposal failed to reload.',
      'proposal_reload_success': 'Proposal reloaded successfully.'
    }
  },
  proposalNavigationItem: 'budgets',

  hidePostDoc: computed('sectionLookup.sectionInfo', function() {
    const sectionObject = this.get('sectionLookup.sectionInfo');
    return (sectionObject && sectionObject.PMP && sectionObject.PMP.enableAccess === false);
  }),

  hideBudgetImpact: computed('sectionLookup.sectionInfo', function() {
    const sectionObject = this.get('sectionLookup.sectionInfo');
    return (sectionObject && sectionObject.BUDI && sectionObject.BUDI.enableAccess === false);
  }),

  willDestroy(...args) {
    this._super(args);
    window.removeEventListener('popstate', this.abortCurrentTransition);
  },

  actions: {
    reloadProposal() {
      this.send('reloadProposalRoute');
    },

    updatePageInfo({ linkInfo, trackNote }) {
      const ajaxInProgress = this.get('transitionService').ajaxInProgress;
      if(ajaxInProgress) return; // disable the nav-bar actions if an important ajax call is in-progress

      const routeName = (linkInfo === 'proposal') ? 'proposal.index' : `proposal.${linkInfo}`;

      if (trackNote) this.get('analytics').trackEvent(trackNote);
      this.get('transitionService').abortResetLoadingTransition();
      this.transitionToRoute(routeName, this.get('model'));
    },

    /**
     * removeMenu() and insertMenu() - Menu Item Click
     * move page contents and breadcrumbs as necessary so it has the correct bootstrap layout
     */
    removeMenu() {
      $('.rgov-left-nav').hide();

      setTimeout(() => {
        if ($('.rgov-left-nav #mainMenu').hasClass('collapsed')) {
          $('#pageMenuHidden #contents').detach().appendTo('#contentsNoMenu');
        }
        else {
          $('#pageMenuShown #contents').detach().appendTo('#contentsNoMenu');
        }
        $('#breadcrumbsWithMenu > .row').detach().appendTo('#breadcrumbsNoMenu');
      }, 0);
    },
    insertMenu() {
      $('.rgov-left-nav').show();

      setTimeout(() => {
        if ($('.rgov-left-nav #mainMenu').hasClass('collapsed')) {
          $('#contentsNoMenu #contents').detach().appendTo('#pageMenuHidden');
        }
        else {
          $('#contentsNoMenu #contents').detach().appendTo('#pageMenuShown');
        }
        $('#breadcrumbsNoMenu > .row').detach().appendTo('#breadcrumbsWithMenu');
      }, 0);
    },

    exitToMyDesktop() {
      if (this.get('props') && this.get('props').uiFeatureToggles && this.get('props').uiFeatureToggles.myDesktopLink) {
        window.open(this.get('props').uiFeatureToggles.myDesktopLink, '_self');
      }
    }

  }

});
