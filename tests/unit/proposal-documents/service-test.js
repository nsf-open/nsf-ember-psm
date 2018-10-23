import { moduleFor, test } from 'ember-qunit';
import Service from '@ember/service';
const response = {};

const apiStub = Service.extend({
  httpDelete({path, parameters}) {
    return Promise.resolve([path, parameters]);
  },
  httpGet() {
    return Promise.resolve(response);
  }
});

const proposalConstantsStub = Service.extend({
  init(...args) {
    this._super(...args);

    this.set('SYSTEM_ERROR', {
      FILE_UPLOAD: 'test'
    });
  }
});


moduleFor('service:proposal-document', 'Unit | Service | proposal documents', {
  needs: ['service:active-user', 'service:properties', 'service:proposal-status', 'service:messages'],
  beforeEach() {
    this.register('service:api', apiStub);
    this.inject.service('api', { as: 'api' });

    this.register('service:proposal-constants', proposalConstantsStub);
    this.inject.service('PROPOSAL_CONSTANTS', { as: 'PROPOSAL_CONSTANTS' });
  }
});

test('delete method should work as expected', function(assert) {
  const service = this.subject();
  const deleteOptions = {apiPath: '/test', propPrepId: 1, propRevId: 3, personnelId: 5,
  sectionCode: '01', previewRequired: false}
  const promise = service.deleteDocument(deleteOptions);

  promise.then((proposals) => {
    const shouldBeProposals = [
      `${deleteOptions.apiPath}.fileDelete`,
      [deleteOptions.propPrepId,
        deleteOptions.propRevId,
        deleteOptions.sectionCode,
        deleteOptions.personnelId]
    ];
    assert.deepEqual(proposals, shouldBeProposals);
  });
});
