import { inject as service } from '@ember/service';
import SingleFileUploadController from '../single-file-upload-base-controller';

export default SingleFileUploadController.extend({
  PROPOSAL_CONSTANTS: service('proposal-constants'),

  breadCrumb: 'Other Personnel Biographical Information',
  sectionKey: 'OPBIO'
});
