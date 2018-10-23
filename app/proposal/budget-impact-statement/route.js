import SingleFileUploadRoute from '../single-file-upload-base-route';

export default SingleFileUploadRoute.extend({
  init(...args) {
    this.set('proposalStatusesForMessage', ['08', '13']);
    this._super(...args);
  },

  routeProposalStatusGuard({ proposalStatus, propPrepRevnTypeCode}) {
    return ['07', '08', '09', '10', '11', '12', '13', '14', '15', '16'].indexOf(proposalStatus) > -1
    || (['05'].indexOf(proposalStatus) > -1 && propPrepRevnTypeCode !== 'ORIG');
  }

});
