import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { alias } from '@ember/object/computed';
import { computed } from '@ember/object';

export default Controller.extend({

  props: service('properties'),

  proposalsType: alias('model.proposalsType'),

  proposalsPageTitle: computed('proposalsType', function() {
    const proposalsType = this.get('proposalsType');
    if (proposalsType === 'inprogress') {
      return 'NSF In Progress Proposals';
    }
    else if (proposalsType === 'submitted') {
      return 'NSF Submitted Proposals';
    }
    return '';
  }),

  proposalsPageHeader: computed('proposalsType', function() {
    const proposalsType = this.get('proposalsType');
    if (proposalsType === 'inprogress') {
      return 'In Progress Proposals';
    }
    else if (proposalsType === 'submitted') {
      return 'Submitted Proposals';
    }
    return '';
  }),

  breadCrumbs: computed('proposalsPageHeader', function() {
    const proposalTypeName = this.get('proposalsPageHeader');
    const breadCrumbArray = [
      {label: 'My Desktop', action: 'exitToMyDesktop'},
      {label: 'Proposal Preparation', path: 'proposal-prep'},
      {label: proposalTypeName}
    ];
    return breadCrumbArray;
  }),

  actions: {

    createRevision(proposalItem) {
      this.transitionToRoute('proposal', proposalItem.propPrepId, proposalItem.propRevId);
    },

    exitToMyDesktop() {
      if (this.get('props') && this.get('props').uiFeatureToggles && this.get('props').uiFeatureToggles.myDesktopLink) {
        window.open(this.get('props').uiFeatureToggles.myDesktopLink, '_self');
      }
    }

  }


});
