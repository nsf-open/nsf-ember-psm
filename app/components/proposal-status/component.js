import Component from '@ember/component';

import { ProposalStatus } from '../../proposal-status';

const STATUS_TYPES_TITLES = ProposalStatus.STATUS_TYPES_TITLES;

export default Component.extend({
  init(...args) {
    this._super(args);

    this.text = {
      hasAccess: ' = Has access',
      title: 'Proposal Status'
    };
    this.statusOrder = ['pIOAU', 'sPO', 'aOR'];

    this.set('proposalStatusNumber', parseInt(this.get('currentProposalStatus'), 10));
    this.statusTypes = this.statusOrder.map((statusKey) => {
      return {
        statusKey,
        statusTypeTitle: STATUS_TYPES_TITLES[statusKey]
      };
    });

  }

});
