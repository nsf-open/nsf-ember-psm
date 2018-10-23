
import { inject as service } from '@ember/service';
import { hash } from 'rsvp';

import SingleFileUploadRoute from '../../single-file-upload-base-route';

export default SingleFileUploadRoute.extend({
  activeUser: service('active-user'),
  pageInfo: service('page-info'),
  personnelService: service('personnel'),
  props: service('properties'),

  updateTitleAfterModel: true,

  model(params) {
    const proposal = this.modelFor('proposal');
    const { propPrepId, propRevId, proposalStatus } = proposal;
    const personnelId = params.personnel_id;
    return hash({
      'personnel': this.get('personnelService').getPersonnel({propPrepId, propRevId, personnelId}),
      'personnelId': personnelId,
      'propPrepId': propPrepId,
      'propRevId': propRevId,
      'proposalStatus': proposalStatus
    });
  }
});
