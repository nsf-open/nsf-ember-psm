import SingleFileUploadRoute from '../single-file-upload-base-route';

export default SingleFileUploadRoute.extend({
  init(...args) {
    this.set('proposalStatusesForMessage', ['01', '08', '13']);
    this._super(...args);
  }
});
