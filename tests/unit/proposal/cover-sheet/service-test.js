import { moduleFor, test } from 'ember-qunit';
import Service from '@ember/service';

const institutions = [];
const coverSheet = {
  proposalDuration: 0
};
const messages = [];
const updateCoverSheetData = {};

const apiStub = Service.extend({
  httpGet(parameter) {
    let apiStubResponse;
    if (parameter === 'apis.coverSheet.getOrgs') {
      apiStubResponse = {
        institutions
      };
    }
    else if (parameter === 'apis.coverSheet.get') {
      apiStubResponse = {
        messages,
        coverSheet
      };
    }

    return Promise.resolve(apiStubResponse);
  },
  httpPost(parameterObj) {
    let apiStubResponse;
    if (parameterObj.path === 'apis.coverSheet.updateAwardeeOrg') {
      apiStubResponse = parameterObj;
    }
    else if (parameterObj.path === 'apis.coverSheet.save') {
      apiStubResponse = updateCoverSheetData;
    }
    return Promise.resolve(apiStubResponse);
  }
});

const countries = [];
const internationalCountries = [];
const states = [];

const countriesServiceStub = Service.extend({
  getAllCountries() {
    return countries;
  },
  getInternationalCountries() {
    return internationalCountries;
  },
  getAllStates() {
    return states;
  }
});


moduleFor('service:proposal/cover-sheet', 'Unit | Service | proposal/cover sheet', {
  // Specify the other units that are required for this test.
  needs: ['service:active-user', 'service:properties', 'service:messages', 'service:lookups', 'service:countries'],
  beforeEach() {
    this.register('service:api', apiStub);
    this.inject.service('api', { as: 'api' });


    this.register('service:countries', countriesServiceStub);
    this.inject.service('countries', { as: 'countries' });
  }
});

// Replace this with your real tests.
test('getCoverSheetData() method works as expected', function(assert) {
  const service = this.subject();
  const propPrepId = 122;
  const propRevId = 121;
  const proposalStatus = 1212;
  const propPrepRevnTypeCode = 432;

  const promise = service.getCoverSheetData({
    propPrepId,
    propRevId,
    proposalStatus,
    propPrepRevnTypeCode
  });

  const shouldBeCoverSheetData = {
    propPrepId,
    propRevId,
    proposalStatus,
    propPrepRevnTypeCode,
    countries,
    internationalCountries,
    states,
    institutions,
    coverSheetMessages: messages,
    coverSheet: Object.assign({}, coverSheet, {
      proposalDuration: ''
    })
  };

  promise.then((coverSheetData) => {
    assert.deepEqual(coverSheetData, shouldBeCoverSheetData);
  });
});

test('updateAwardeeOrg() method works as expected', function(assert) {
  const service = this.subject();
  const updateAwardeeOrgParameters = {
    propPrepId: 'A',
    propRevId: 'B',
    coverSheetId: 'C',
    selectedNewAwardeeOrg: 'D'
  };

  const {
    propPrepId,
    propRevId,
    coverSheetId,
    selectedNewAwardeeOrg
  } = updateAwardeeOrgParameters;

  const shouldBeUpdateAwardeeOrgData = {
    path: 'apis.coverSheet.updateAwardeeOrg',
    data: selectedNewAwardeeOrg,
    parameters: [
      propPrepId,
      propRevId,
      coverSheetId
    ]
  };

  const promise = service.updateAwardeeOrg(updateAwardeeOrgParameters);
  promise.then((updateAwardeeOrgData) => {
    assert.deepEqual(updateAwardeeOrgData, shouldBeUpdateAwardeeOrgData);
  });
});

test('updateCoverSheet() method works as expected', function(assert) {
  const service = this.subject();
  const coverSheetInput = {};
  const promise = service.updateCoverSheet({coverSheet: coverSheetInput});
  const shouldBeCoverSheetData = updateCoverSheetData;
  promise.then((coverSheetData) => {
    assert.equal(coverSheetData, shouldBeCoverSheetData);
  });
});
