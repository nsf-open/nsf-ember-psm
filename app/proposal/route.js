import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { hash } from 'rsvp';
import { isEmpty } from '@ember/utils';

import { updateNavByLinkName } from './util/update-proposal-nav';

function updatePageInfo(transition) {
  const controllerName = transition.targetName;

  try {
    this.get('transitionService').setLoadingTransition(transition);
    this.get('pageInfo').updatePageInfoByControllerName(controllerName);
  }
  catch(error) {
    return;
  }

}

function getCurrentRouteName(transition) {
  const matchRouteArr = transition.targetName.match(/^proposal.([\w-]+)/);

  if(matchRouteArr === null) return null; // if not a proposal child route return nothing

  const childRoute = matchRouteArr[1];
  return childRoute;
}

export default Route.extend({
  activeUser: service('active-user'),
  lookups: service('lookups'),
  messageService: service('messages'),
  pageInfo: service('page-info'),
  permissions: service('permissions'),
  proposalService: service('proposal'),
  props: service('properties'),
  sectionLookup: service('section-lookup'),
  transitionService: service('transition'),

  init() {
    this._super(...arguments);
    this.messageTexts = {
      'no_available_due_dates': 'All due dates for this funding opportunity have passed and none are scheduled in the next 12 months; therefore, this proposal cannot be submitted.'
    }
  },

  beforeModel() {
    const loadDataPromises = [
      this.get('sectionLookup').load(),
      this.get('lookups').load('deadlineTypes'),
      this.get('props').load()
    ];

    return Promise.all(loadDataPromises).catch(() => { });
  },

  model(params, transition) {
    const self = this;

    const { prop_prep_id: propPrepId, prop_rev_id: propRevId } = params;

    return hash({
      permissions: this.get('proposalService').getProposalPermissions({propPrepId, propRevId}),
      proposalPackage: this.get('proposalService').getProposal({propPrepId, propRevId})
    }).then((hash) => {
      if (hash.permissions && hash.permissions.userProfile) {
        if (hash.permissions.userProfile.permissions) {
          self.get('permissions').resetPermissions(hash.permissions.userProfile.permissions);
        }
        else {
          self.transitionTo('proposal-prep');
        }
        if (hash.permissions.userProfile.roles) {
          self.get('permissions').setRoles(hash.permissions.userProfile.roles);
        }
        if (!self.get('permissions').hasPermission('proposal.view')) {
          self.transitionTo('proposal-prep');
        }
      }
      else {
        self.transitionTo('proposal-prep');
      }

      // if proposal status is submitted (>=5) and disableViewSubmitted toggle is set then redirect to proposal-prep
      if (parseInt(hash.proposalPackage.proposalPackage.proposalStatus, 10) >= 5 && self.get('props').uiFeatureToggles.disableViewSubmittedProposals) {
        self.transitionTo('proposal-prep');
      }

      const modelObject = hash.proposalPackage.proposalPackage;

      // check to show passed/no due dates error message
      const acceptedAnytime = modelObject.deadline.deadlineTypeCode === '3';
      const deadlineDates = modelObject.dueDates;

      let temp;
      let noChosenDeadlineDate = false;
      if (modelObject.deadline.deadlineDate) {
        temp = modelObject.deadline.deadlineDate;
      }
      else {
        temp = {};
        noChosenDeadlineDate = true;
      }

      const chosenDeadlineDate = moment(temp);
      const onemonthAgo = moment().subtract(1, 'months');
      const oneYearFuture = moment().add(1, 'years');
      const chosenDeadlineValid = chosenDeadlineDate.isBetween(onemonthAgo, oneYearFuture, null, '[]');


      if (!acceptedAnytime && isEmpty(deadlineDates) && (noChosenDeadlineDate || !chosenDeadlineValid)) {
        const message = {
          status: 'error',
          dismissable: false,
          message: self.get('messageTexts.no_available_due_dates'),
          level: self.get('messageService').LEVEL_SCREEN,
          displayRoute: 'proposal.index'
        };
        self.get('messageService').addMessage(message);
      }

      modelObject.isCollaborativeProposal = false; // Currently, ALL proposals are NOT collaborative

      // -- When the proposal route starts save the initial child route name here in the model to pass to setup-controller method
      const childRoute = getCurrentRouteName(transition);
      modelObject.initialRouteName = childRoute;

      return modelObject;
    });
  },

  afterModel(proposalPackage, transition) {
    updatePageInfo.call(this, transition);
    // Store some global properties in window.Psm
    if (!window.Psm) {
      window.Psm = {};
    }
    if (proposalPackage && proposalPackage.propPrepId) {
      window.Psm.propPrepId = proposalPackage.propPrepId;
    }
    if (proposalPackage && proposalPackage.propRevId) {
      window.Psm.proposalRevID = proposalPackage.propRevId; // propPrepRevId;
    }
    if (!window.Psm.institutionID) {
      window.Psm.institutionID = '0022905000';
    }

    this.get('sectionLookup').loadForProposal(proposalPackage.propPrepId, proposalPackage.propRevId);

    if (!window.Psm) {
      window.Psm = {};
    }
    window.Psm.nsfID = this.get('activeUser').getNSFID();


  },

  setupController(controller, model) {
    // Call _super for default behavior
    this._super(controller, model);

    controller.set('currentRouteName', model.initialRouteName);
  },


  actions: {
    reloadProposalRoute() {
      this.refresh();
    },
    didTransition() {
      this.get('transitionService').resetLoadingTransition();


    },

    willTransition(transition) {
      if (!this.get('permissions').hasPermission('proposal.view')) {
        this.transitionTo('proposal-prep');
        return false;
      }

      updatePageInfo.call(this, transition);
      const sendFunc = this.controller.send.bind(this.controller);
      updateNavByLinkName(transition.targetName, sendFunc);

      const childRoute = getCurrentRouteName(transition);
      this.controller.set('currentRouteName', childRoute);

      return true;
    },
    error(error) {
      if (error) {
        // this likely indicates an invalid proposal id in the url,
        // we may want a different error page here?
        this.transitionTo('error');


        return true;
      }
    }
  }
});
