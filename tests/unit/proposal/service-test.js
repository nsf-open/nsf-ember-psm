import { moduleFor, test } from 'ember-qunit';
import Service from '@ember/service';

import Proposal from 'psm/proposal/model';

const response = {
  // - for getProposal tests
  proposalPackage: {
  },

  // for getInProgressProposals tests
  proposals: [
    {
      propPrepId: '10',
    }
  ]
};
const apiStub = Service.extend({
  httpGet() {
    return Promise.resolve(response);
  }
});

const statuses = [];
const proposalStatusStub = Service.extend({
  getStatuses() {
    return statuses;
  }
});


moduleFor('service:proposal', 'in progress proposals', {
  // Specify the other units that are required for this test.
  needs: ['service:active-user', 'service:api', 'service:properties', 'service:proposal-status', 'service:messages'],
  beforeEach() {
    this.register('service:api', apiStub);
    this.inject.service('api', { as: 'api' });


    this.register('service:proposal-status', proposalStatusStub);
    this.inject.service('proposal-status', { as: 'proposalStatus' });
  }
});

test('getInProgressProposals() method works as intended', function(assert) {
  const service = this.subject();
  const promise = service.getInProgressProposals();

  promise.then((proposals) => {
    const shouldBeProposals = [
      Proposal.create({
        propPrepId: '10',
        propPrepIdNumeric: 10,
        deadlineDateSortIndex: 999999999999999999999999
      })
    ];
    assert.deepEqual(proposals, shouldBeProposals);
  });
});

test('getProposal() method works as intended', function(assert) {
  const service = this.subject();
  const promise = service.getProposal({ propPrepId: 1, propRevId: 2 });

  promise.then((_response) => {
    const proposal = _response.proposalPackage;
    const shouldBeProposal = Proposal.create(response.proposalPackage);
    assert.deepEqual(proposal, shouldBeProposal);
  });
});

test('getSubmittedProposals() method works as intended', function(assert) {
  // -- Change the response data in the stubbed api service for submitted proposals
  response.proposals = [
    {
      propPrepId: '10',
      propRevId: '11',
      nsfPropId: '13'
    }
  ];

  const service = this.subject();
  const promise = service.getSubmittedProposals();

  promise.then((proposals) => {
    const shouldBeProposals = [
      Proposal.create({
        propPrepId: '10',
        propPrepIdNumeric: 10,
        propRevId: '11',
        origPropRevId: '11',
        nsfPropId: '13',
        nsfPropIdNumeric: 13
      })
    ];
    assert.deepEqual(proposals, shouldBeProposals);
  });
});
