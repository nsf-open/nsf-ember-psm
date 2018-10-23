import { getFullNameByPerson } from '../util';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import { isBlank } from '@ember/utils';

import SingleFileUploadController from '../../single-file-upload-base-controller';

export default SingleFileUploadController.extend({
  PROPOSAL_CONSTANTS: service('proposal-constants'),
  transitionService: service('transition'),

  apiPath: 'apis.personnelDocumentsUpload',
  sectionKey: 'CURR_PEND_SUPP',
  sectionName: 'Current and Pending Support',

  breadCrumb: computed('model.personnel.personnel', function() {
    const person = this.get('model.personnel.personnel');
    const sectionName = this.sectionName;
    if (isBlank(person)) {
      return sectionName;
    }

    const name = getFullNameByPerson(person);
    return `${sectionName} - ${name}`;
  })
});
