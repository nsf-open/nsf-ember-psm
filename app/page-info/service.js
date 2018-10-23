import Service from '@ember/service';
import { inject as service } from '@ember/service';
import { getOwner } from '@ember/application';
import { computed } from '@ember/object';

const PROP_KEYS = ['title', 'description', 'institutionInfo', 'isProposalIndex'];

function setProperties({ propKeys, argObj }) {
  const keys = propKeys || Object.keys(argObj);

  keys.forEach((key) => {
    this.set(key, argObj[key]);
  });
}

function getProposalIndexTitle() {
  const currentProposal = this.get('proposalService').currentProposal;

  if (currentProposal.get('isInPFUStatus')) {
    return 'Proposal File Update/Budget Revision';
  }

  const proposalNumber = currentProposal.nsfPropId || currentProposal.propPrepId;
  const viewOnly = !this.get('permissions').hasPermission('proposal.data.modify');
  const viewOnlyStatuses = currentProposal.get('isViewOnly');
  const viewOnlyText = (viewOnly && viewOnlyStatuses) ? ' (View Only)' : '';
  const proposalIndexTitle = `Proposal - ${proposalNumber}${viewOnlyText}`;

  return proposalIndexTitle;
}

export default Service.extend({
  permissions: service('permissions'),
  proposalService: service('proposal'),

  title: null,
  proposalID: null,
  isProposalIndex: false,

  setPageInfo(argObj) {
    setProperties.call(this, { propKeys: PROP_KEYS, argObj });
  },

  resetPageInfo() {
    setProperties.call(this, {
      argObj: PROP_KEYS.reduce((accum, key) => {
        accum[key] = null;
        return accum;
      }, {})
    });
  },

  updatePageInfoByControllerName(controllerName) {
    const controller = getOwner(this).lookup(`controller:${controllerName}`);
    const { institutionInfo, titleDescription } = controller;
    const breadCrumb = (controller.get('breadCrumb') ? controller.get('breadCrumb') : controller.get('breadCrumbForTitle'));

    this.resetPageInfo();
    this.setPageInfo({
      description: titleDescription,
      title: breadCrumb,
      institutionInfo,
      isProposalIndex: controllerName === 'proposal.index'
    });
  },

  sectionTitle: computed('title', function() {
    const proposalIndexTitle = getProposalIndexTitle.call(this);

    return (this.isProposalIndex) ? proposalIndexTitle : this.title;
  }),

  subTitle: computed('title', function() {
    const currentProposal = this.get('proposalService').currentProposal;
    const proposalNumber = currentProposal.nsfPropId || currentProposal.propPrepId
    const proposalIndexSubTitle = `For Proposal - ${proposalNumber}`;

    if (this.isProposalIndex && currentProposal.get('isInPFUStatus')) {
      return proposalIndexSubTitle;
    }
  })

});
