import Object from '@ember/object';
import { computed } from '@ember/object';

export default Object.extend({
  isSubmittedProposal: computed('proposalStatus', function() {
    const proposalStatus = this.proposalStatus;
    const proposalStatusNumber = Number(proposalStatus);
    return proposalStatusNumber >= 5;
  }),
  isInPFUStatus: computed('proposalStatus', 'propPrepRevnTypeCode', function() {
    const proposalStatus = this.proposalStatus;
    const propPrepRevnTypeCode = this.propPrepRevnTypeCode;
    const proposalStatusNumber = Number(proposalStatus);
    if (proposalStatusNumber >= 7 && proposalStatusNumber <= 16) {
      return true;
    }
    else if (proposalStatusNumber === 5 && propPrepRevnTypeCode !== 'ORIG') {
      return true;
    }
    return false;
  }),
  isViewOnly: computed('proposalStatus', function() {
    const proposalStatus = this.proposalStatus;
    const proposalStatusNumber = Number(proposalStatus);

    return (proposalStatusNumber === 1 || proposalStatusNumber === 8);
  }),

  shortName: computed('isInPFUStatus', 'nsfPropId', 'propPrepId', function() {
    const nsfPropId = this.get('nsfPropId');
    const propPrepId = this.get('propPrepId');
    const isInPFUStatus = this.get('isInPFUStatus');

    let proposalTitle = `Proposal - ${propPrepId}`;
    if (isInPFUStatus) {
      proposalTitle = 'PFU/Budget Revision';
    }
    else if (nsfPropId) {
      proposalTitle = `Proposal - ${nsfPropId}`;
    }
    return proposalTitle;
  })
});
