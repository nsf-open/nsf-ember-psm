import Service from '@ember/service';
import { inject as service } from '@ember/service';

import Proposal from './model';

export default Service.extend({
  activeUser: service('active-user'),
  api: service('api'),
  props: service('properties'),
  proposalStatusService: service('proposal-status'),
  messageService: service('messages'),

  currentProposal: null,

  createProposal(proposalData) {
    return this.get('api').httpPost({
      path: 'apis.wizard.createProposal',
      data: proposalData
    });
  },

  getComplianceStatus({propPrepId, propRevId}) {
    return this.get('api').httpGet('apis.proposal.complianceStatus', propPrepId, propRevId);
  },

  getElectronicSign({propPrepId, propRevId}) {
    return this.get('api').httpGet('apis.proposal.electronicSign', propPrepId, propRevId);
  },

  getProposal({ propPrepId, propRevId }) {
    return this.get('api').httpGet('apis.proposal.getProposal', propPrepId, propRevId)
      .then((response) => {
        const proposal = Proposal.create(response.proposalPackage);
        this.set('currentProposal', proposal);

        response.proposalPackage = proposal; // override the property value with the Proposal object
        const proposalStatusGroups = this.get('proposalStatusService').getStatuses(proposal.get('isSubmittedProposal'));
        proposal.set('proposalStatusGroups', proposalStatusGroups);

        // any messages returned from the getProposal method should be persistent because they will always apply to the proposal
        // we will only clear/reset this set of messages if we make another getProposal call
        this.get('messageService').clearMessagesById('getProposal');

        if (response && response.messages && response.messages.length && response.messages.length !== 0) {
          for (let i = 0; i < response.messages.length; i += 1) {
            if (response.messages[i].type === 'ERROR') {
              const message = {status: 'error', dismissable: false, message: response.messages[i].description, id: 'getProposal', level: 'CROSS_SCREEN', displayRoute: 'proposal.index', persist: true};
              this.get('messageService').addMessage(message);
            }
            else if (response.messages[i].type === 'WARNING') {
              const message = {status: 'warning', dismissable: false, message: response.messages[i].description, id: 'getProposal', level: 'CROSS_SCREEN', displayRoute: 'proposal.index', persist: true};
              this.get('messageService').addMessage(message);
            }
            else if (response.messages[i].type === 'INFO') {
              const message = {status: 'info', dismissable: false, message: response.messages[i].description, id: 'getProposal', level: 'CROSS_SCREEN', displayRoute: 'proposal.index', persist: true};
              this.get('messageService').addMessage(message);
            }
          }
        }

        return response;
      });
  },

  getProposalAccess({propPrepId, propRevId}) {
    return this.get('api').httpGet('apis.proposal.proposalAccess', propPrepId, propRevId);
  },

  getProposalJustification({propPrepId, propRevId}) {
    return this.get('api').httpGet('apis.proposal.getProposalJustification', propPrepId, propRevId);
  },

  getProposalSections() {
    return this.get('api').httpGet('apis.proposal.proposalSections');
  },

  getProposalStatus({propPrepId, propRevId}) {
    return this.get('api').httpGet('apis.proposal.proposalStatus', propPrepId, propRevId);
  },

  getProposalTypes() {
    return this.get('api').httpGet('apis.wizard.propType');
  },

  getInProgressProposals() {
    return this.get('api').httpGet('apis.proposalPrep.inProgressProposals', this.get('activeUser').getNSFID())
    .then((response) => {
      if (response.proposals) {
        // Set a deadlineDateSortIndex property so that we can order deadline dates in this order:
        // 1. Deadline Date occurring first 2. Accepted Anytime 3. None Selected
        for (let i = 0; i < response.proposals.length; i += 1) {
          if (response.proposals[i].deadlineDate) {
            response.proposals[i].deadlineDateSortIndex = new Date(response.proposals[i].deadlineDate).getTime();
          }
          else if (response.proposals[i].deadlineTypeCode && response.proposals[i].deadlineTypeCode == '3') {
            response.proposals[i].deadlineDateSortIndex = 777777777777777777777777; // Accepted Anytime
          }
          else if (response.proposals[i].deadlineTypeText && response.proposals[i].deadlineTypeText == 'No dates available (cannot submit)') {
            response.proposals[i].deadlineDateSortIndex = 888888888888888888888888; // No dates available (cannot submit)
          }
          else {
            response.proposals[i].deadlineDateSortIndex = 999999999999999999999999; // None Selected
          }
          response.proposals[i].propPrepIdNumeric = response.proposals[i].propPrepId ? parseInt(response.proposals[i].propPrepId, 10) : response.proposals[i].propPrepId;
        }
      }

      return response.proposals.map(proposalData => Proposal.create(proposalData));
    });
  },
  getSubmittedProposals() {
    return this.get('api').httpGet('apis.proposalPrep.submittedProposals', this.get('activeUser').getNSFID())
    .then((response) => {
      if (response.proposals) {
        for (let i = 0; i < response.proposals.length; i += 1) {
          const propInfo = response.proposals[i];
          // normalize submDate format for display
          if (propInfo.submDate) {
            response.proposals[i].submDateSortIndex = new Date(propInfo.submDate).getTime();
            response.proposals[i].submDate = propInfo.submDate.substring(0, propInfo.submDate.indexOf(' '));
          }
          response.proposals[i].origPropRevId = propInfo.propRevId;
          response.proposals[i].propPrepIdNumeric = propInfo.propPrepId ? parseInt(propInfo.propPrepId, 10) : propInfo.propPrepId;
          response.proposals[i].nsfPropIdNumeric = propInfo.nsfPropId ? parseInt(propInfo.nsfPropId, 10) : propInfo.nsfPropId;
          if (propInfo.pfuProposals && propInfo.pfuProposals.length) {
            // if pfu in progress, use last submitted rev id as parent link
            if (propInfo.propLatestSubmittedRevId) {
              response.proposals[i].origPropRevId = propInfo.propLatestSubmittedRevId;
            }
            for (let j = 0; j < propInfo.pfuProposals.length; j += 1) {
              if (propInfo.pfuProposals[j].lastUpdateDate) {
                response.proposals[i].pfuProposals[j].lastUpdateDateFormatted = propInfo.pfuProposals[j].lastUpdateDate.substring(0, propInfo.pfuProposals[j].lastUpdateDate.indexOf(' '));
              }
              else {
                response.proposals[i].pfuProposals[j].lastUpdateDateFormatted = '';
              }
              // if any pfu child has a status error, set property on parent
              if (propInfo.pfuProposals[j].statusError) {
                response.proposals[i].pfuChildHasError = true;
              }
              else {
                response.proposals[i].pfuChildHasError = false;
              }
            }
          }
        }
      }

      return response.proposals.map(proposalData => Proposal.create(proposalData));
    });
  },

  getProposalPermissions({ propPrepId, propRevId }) {
    return this.get('api').httpGet('apis.userData.permissionsGet', this.get('activeUser').getNSFID(), propPrepId, propRevId);
  },

  initiateRevision({propPrepId, propRevId, nsfPropId}) {
    return this.get('api').httpPost({
      path: 'apis.proposalPrep.initiateRevision',
      parameters: [propPrepId, propRevId, nsfPropId]
    });
  },

  submitProposal(proposalData) {
    return this.get('api').httpPost({
      path: 'apis.proposal.submit',
      data: proposalData
    });
  },

  getSubmissionTypes() {
    return this.get('api').httpGet('apis.wizard.submType');
  },

  saveProposalAccess(accessData) {
    return this.get('api').httpPost({
      path: 'apis.proposal.proposalAccessSave',
      data: accessData
    });
  },

  saveProposalJustification({ data, propPrepId, propRevId }) {
    return this.get('api').httpPost({
      path: 'apis.proposal.saveProposalJustification',
      parameters: [propPrepId, propRevId],
      data
    });
  },

  updateProposal(proposalData) {
    return this.get('api').httpPost({
      path: 'apis.proposal.update',
      data: proposalData
    });
  }




});
