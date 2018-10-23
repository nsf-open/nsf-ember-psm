
import EmberObject from '@ember/object';
import { enumeration } from '../utils';


const Permissions = enumeration({
  View: 1,
  Edit: 2,
  Submit: 3
});

const DEFAULT_PROPOSAL_STATUS = {
  pIOAU: [],
  sPO: [],
  aOR: []
};

const ProposalStatus = EmberObject.extend({
  init() {
    if (!this.statusName) {
      throw new Error('Proposal Status statusName required');
    }

    const keys = Object.keys(DEFAULT_PROPOSAL_STATUS);
    keys.forEach((key) => {
      this.set(key, Object.assign([], DEFAULT_PROPOSAL_STATUS[key], this.get(key)));
    });
  },

  hasTypeStatus(key) {
    const typeStatus = this.get(key);
    return typeStatus.length !== 0;
  },

  typeStatusDisplay(key) {
    const typeStatus = this.get(key);
    let statusDisplay = '';

    if (typeStatus.includes(Permissions.Edit) && typeStatus.includes(Permissions.Submit)) {
      statusDisplay = 'Edit and Submit';
    }
    else if (typeStatus.includes(Permissions.Edit)) {
      statusDisplay = 'Edit';
    }
    else if (typeStatus.includes(Permissions.View)) {
      statusDisplay = 'View only';
    }

    return `(${statusDisplay})`;
  }
});

ProposalStatus.STATUS_TYPES_TITLES = {
  pIOAU: 'PI, co-PI, OAU',
  sPO: 'Sponsored Projects Office (SPO)',
  aOR: 'Authorized Organizational Representative (AOR)'
};

ProposalStatus.Permissions = Permissions;

export default ProposalStatus;
