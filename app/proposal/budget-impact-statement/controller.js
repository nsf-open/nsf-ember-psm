import { inject as service } from '@ember/service';

import SingleFileUploadController from '../single-file-upload-base-controller';

export default SingleFileUploadController.extend({
  transitionService: service('transition'),
  PROPOSAL_CONSTANTS: service('proposal-constants'),

  breadCrumb: 'Budget Impact Statement',
  sectionKey: 'BUDI'

});
