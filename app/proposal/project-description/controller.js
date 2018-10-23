import { inject as service } from '@ember/service';
import SingleFileUploadController from '../single-file-upload-base-controller';

export default SingleFileUploadController.extend({
  PROPOSAL_CONSTANTS: service('proposal-constants'),
  transitionService: service('transition'),

  breadCrumb: 'Project Description',
  sectionKey: 'PROJ_DESC',
  titleDescription: 'Including Results from Prior NSF Support'
});
