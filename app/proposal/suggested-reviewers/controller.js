import SingleFileUploadController from '../single-file-upload-base-controller';
import { inject as service } from '@ember/service';

export default SingleFileUploadController.extend({
  PROPOSAL_CONSTANTS: service('proposal-constants'),
  transitionService: service('transition'),

  breadCrumb: 'List of Suggested Reviewers',
  sectionKey: 'SRL' // Suggested Reviewer List
});
