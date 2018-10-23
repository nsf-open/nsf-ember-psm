import Service from '@ember/service';

import ProposalStatus from './proposal-status';
import ProposalStatusGroup from './proposal-status-group';
import { enumeration } from '../utils';

const Permissions = ProposalStatus.Permissions;

const proposalStatusData = {
  NOT_SHARED_WITH_SPO_AOR: {
    statusName: 'Not Shared with SPO/AOR',
    pIOAU: [Permissions.Edit]
  },
  VIEW_ONLY_ACCESS_SPO_AOR: {
    statusName: 'View Only Access for SPO/AOR',
    pIOAU: [Permissions.Edit],
    sPO: [Permissions.View],
    aOR: [Permissions.View]
  },
  VIEW_EDIT_ACCESS_SPO_AOR: {
    statusName: 'View/Edit Access for SPO/AOR',
    pIOAU: [Permissions.Edit],
    sPO: [Permissions.Edit],
    aOR: [Permissions.Edit]
  },
  RETURNED_TO_PI: {
    statusName: 'Returned to PI',
    pIOAU: [Permissions.Edit]
  },
  SUBMIT_ACCESS_FOR_AOR: {
    statusName: 'Submit Access for AOR',
    pIOAU: [Permissions.Edit],
    sPO: [Permissions.Edit],
    aOR: [Permissions.Edit, Permissions.Submit]
  },
  SUBMITTED_NOT_YET_ASSIGNED: {
    statusName: 'Submitted to NSF (Not Yet Assigned for Review)',
    pIOAU: [Permissions.View],
    sPO: [Permissions.View],
    aOR: [Permissions.View]
  },
  SUBMITTED_DUE_DATE_PASSED_OR_ASSIGNED: {
    statusName: 'Submitted to NSF (Due Date Passed or Assigned for Review)',
    pIOAU: [Permissions.View],
    sPO: [Permissions.View],
    aOR: [Permissions.View]
  },

  SUBMITTED_DUE_DATE_PASSED_BUT_PRIOR: {
    statusName: 'Submitted to NSF (Due Date Passed But Prior to Reviewer Assignment)',
    pIOAU: [Permissions.View],
    sPO: [Permissions.View],
    aOR: [Permissions.View]
  },
  PENDING: {
    statusName: 'Pending',
    pIOAU: [Permissions.View],
    sPO: [Permissions.View],
    aOR: [Permissions.View]
  },
  RECOMMENDED: {
    statusName: 'Recommended',
    pIOAU: [Permissions.View],
    sPO: [Permissions.View],
    aOR: [Permissions.View]
  },
  AWARDED: {
    statusName: 'Awarded',
    pIOAU: [Permissions.View],
    sPO: [Permissions.View],
    aOR: [Permissions.View]
  },
  DECLINED: {
    statusName: 'Declined',
    pIOAU: [Permissions.View],
    sPO: [Permissions.View],
    aOR: [Permissions.View]
  },
  WITHDRAWN: {
    statusName: 'Withdrawn',
    postSubmission: true,
    pIOAU: [Permissions.View],
    sPO: [Permissions.View],
    aOR: [Permissions.View]
  },
  RETURNED: {
    statusName: 'Returned',
    pIOAU: [Permissions.View],
    sPO: [Permissions.View],
    aOR: [Permissions.View]
  },
  REJECTED: {
    statusName: 'Manual PFU Rejected',
    pIOAU: [Permissions.View],
    sPO: [Permissions.View],
    aOR: [Permissions.View]
  },
  CANNOT_SUBMIT_ASSIGNED: {
    statusName: 'Cannot Submit - Assigned for Review',
    pIOAU: [Permissions.View],
    sPO: [Permissions.View],
    aOR: [Permissions.View]
  },
  CANNOT_SUBMIT_STATUS_CHANGED: {
    statusName: 'Cannot Submit - Proposal Status Changed',
    pIOAU: [Permissions.View],
    sPO: [Permissions.View],
    aOR: [Permissions.View]
  }
};

const permissionKeys = Object.keys(proposalStatusData);
const enumData = permissionKeys.reduce((accum, key) => {
  accum[key] = ProposalStatus.create(proposalStatusData[key])
  return accum;
}, {});
const ProposalStatuses = enumeration(enumData);

const dataToGroupArr = (data) => {
  const statuses = data.statuses.map(status => status.value);
  return ProposalStatusGroup.create({title: data.title, statuses});
}

const inProgressGroupData = [
  {
    title: '',
    statuses: [
      ProposalStatuses.NOT_SHARED_WITH_SPO_AOR,
      ProposalStatuses.VIEW_ONLY_ACCESS_SPO_AOR,
      ProposalStatuses.VIEW_EDIT_ACCESS_SPO_AOR,
      ProposalStatuses.RETURNED_TO_PI,
      ProposalStatuses.SUBMIT_ACCESS_FOR_AOR,
      ProposalStatuses.SUBMITTED_NOT_YET_ASSIGNED,
      ProposalStatuses.SUBMITTED_DUE_DATE_PASSED_BUT_PRIOR,
      ProposalStatuses.SUBMITTED_DUE_DATE_PASSED_OR_ASSIGNED
    ]
  }
];

const submittedGroupData = [
  {
    title: 'Post-Submission Statuses',
    statuses: [
      ProposalStatuses.SUBMITTED_NOT_YET_ASSIGNED,
      ProposalStatuses.SUBMITTED_DUE_DATE_PASSED_BUT_PRIOR,
      ProposalStatuses.SUBMITTED_DUE_DATE_PASSED_OR_ASSIGNED,
      ProposalStatuses.PENDING,
      ProposalStatuses.RECOMMENDED,
      ProposalStatuses.AWARDED,
      ProposalStatuses.DECLINED,
      ProposalStatuses.WITHDRAWN,
      ProposalStatuses.RETURNED,
      ProposalStatuses.REJECTED
    ]
  },
  {
    title: 'PFU/Budget Revision Statuses',
    statuses: [
      ProposalStatuses.NOT_SHARED_WITH_SPO_AOR,
      ProposalStatuses.VIEW_ONLY_ACCESS_SPO_AOR,
      ProposalStatuses.VIEW_EDIT_ACCESS_SPO_AOR,
      ProposalStatuses.RETURNED_TO_PI,
      ProposalStatuses.SUBMIT_ACCESS_FOR_AOR,
      ProposalStatuses.CANNOT_SUBMIT_ASSIGNED,
      ProposalStatuses.CANNOT_SUBMIT_STATUS_CHANGED,
      ProposalStatuses.REJECTED
    ]
  }
];


const inProgressProposalGroups = inProgressGroupData.map(dataToGroupArr)
const submittedProposalGroups = submittedGroupData.map(dataToGroupArr);

export default Service.extend({
  getStatuses(isSubmittedProposal) {
    if (isSubmittedProposal) {
      return submittedProposalGroups;
    }

    return inProgressProposalGroups;
  }
});

