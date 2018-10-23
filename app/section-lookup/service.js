import Service from '@ember/service';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';

import proposalSectionParser from './proposal-section-parser';

export default Service.extend({
  activeUser: service('active-user'),
  proposalService: service('proposal'),
  props: service('properties'),

  _loading: false,
  _loaded: false,
  _loadingForProposal: false,
  _loadedForProposal: false,
  _sectionInfo: null,


  loading: computed('_loading', {
    get() {
      return this.get('_loading');
    }
  }).readOnly(),
  loaded: computed('_loaded', {
    get() {
      return this.get('_loaded');
    }
  }).readOnly(),

  loadingForProposal: computed('_loadingForProposal', {
    get() {
      return this.get('_loadingForProposal');
    }
  }).readOnly(),
  loadedForProposal: computed('_loadedForProposal', {
    get() {
      return this.get('_loadedForProposal');
    }
  }).readOnly(),

  sectionInfo: computed('_sectionInfo', {
    get() {
      return this.get('_sectionInfo');
    }
  }).readOnly(),

  loadForProposal(propPrepId, propRevId) {
    if (this.get('loadingForProposal')) {
      return false;
    }

    this.set('_loadingForProposal', true);

    this.get('proposalService').getProposalStatus({propPrepId, propRevId}).then((response) => {
        // set proposal section lookup
        if (this.get('_sectionInfo')) {
          const mergedSections = Object.assign({}, this.get('sectionInfo'), proposalSectionParser(response.proposalSections));
          this.set('_sectionInfo', mergedSections);
        }
        else {
          this.set('_sectionInfo', proposalSectionParser(response.proposalSections));
        }
        this.set('_loadedForProposal', true);
        this.set('_loadingForProposal', false);
      });
  },

  load() {
    if (this.get('loaded')) {
      return true;
    }

    if (this.get('loading')) {
      return false;
    }

    this.set('_loading', true);

    return this.get('proposalService').getProposalSections().then((response) => {
        // set proposal section lookup
        this.set('_sectionInfo', proposalSectionParser(response.proposalSections));
        this.set('_loaded', true);
        this.set('_loading', false);
      });
  }

});
