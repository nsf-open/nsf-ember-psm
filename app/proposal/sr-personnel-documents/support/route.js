import { inject as service } from '@ember/service';
import { hash } from 'rsvp';
// import $ from 'jquery';

import SingleFileUploadRoute from '../../single-file-upload-base-route';

export default SingleFileUploadRoute.extend({
  activeUser: service('active-user'),
  pageInfo: service('page-info'),
  personnelService: service('personnel'),
  props: service('properties'),

  updateTitleAfterModel: true,

  model(params) {
    const personnelId = params.personnel_id;
    const proposal = this.modelFor('proposal');
    const { propPrepId, propRevId, proposalStatus } = proposal;

    return hash({
      'personnel': this.get('personnelService').getPersonnel({propPrepId, propRevId, personnelId}),
      'personnelId': personnelId,
      'propPrepId': propPrepId,
      'propRevId': propRevId,
      'proposalStatus': proposalStatus
    });
  }
});
