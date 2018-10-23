import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import $ from 'jquery';

export default Controller.extend({
  init() {
    this._super(...arguments);
    this.breadCrumbs = [
      {label: 'My Desktop', action: 'exitToMyDesktop'},
      {label: 'Proposal Preparation'}
    ],
    this.modalText = {
      prepareProposalTitle: 'Information Needed to Prepare a Proposal'
    }
  },

  // breadCrumbPath: "index"

  permissions: service('permissions'),
  props: service('properties'),

  submittedProposalsDisabled: computed('props', function() {
    if (this.get('props').uiFeatureToggles.disableViewSubmittedProposals) {
      return true;
    }
    return false;
  }),

  submittedProposalsDisabledClass: computed('props', function() {
    if (this.get('props').uiFeatureToggles.disableViewSubmittedProposals) {
      return 'disabled';
    }
    return '';
  }),

  disableCreate: computed('permissions.institutionRoles.[]', function() {
    if (this.get('props').uiFeatureToggles.disableCreateProposal) {
      return true;
    }
    return !this.get('permissions').hasInstitutionRole('PI');
  }),
  disableCreateText: computed('disableCreate', function() {
    if (this.get('props').uiFeatureToggles.disableCreateProposal && this.get('props').uiFeatureToggles.disableCreateProposalText) {
      return this.get('props').uiFeatureToggles.disableCreateProposalText;
    }
    if (!this.get('permissions').hasInstitutionRole('PI')) {
      return 'Proposals can only be created by Principal Investigators';
    }
    return '';
  }),

  actions: {

    exitToMyDesktop() {
      if (this.get('props') && this.get('props').uiFeatureToggles && this.get('props').uiFeatureToggles.myDesktopLink) {
        window.open(this.get('props').uiFeatureToggles.myDesktopLink, '_self');
      }
    },
    onEnter(event) {
      if (event.keyCode === 13) {
        $('#proposalInfoModal').modal('show');
      }
    }
  }

});
