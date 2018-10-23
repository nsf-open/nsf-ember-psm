import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';

export default Component.extend({

  props: service('properties'),

  viewProposalLink: computed(/* 'property',*/ function() {
    return this.get('props').getReplace('apis.proposal.apiProposalFileView', [this.get('coverSheet.propPrepId'), this.get('coverSheet.propRevId')]);
  }),

});
