import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import { isBlank } from '@ember/utils';
import { getFullNameByPerson } from '../util';

import SingleFileUploadController from '../../single-file-upload-base-controller';

export default SingleFileUploadController.extend({
  transitionService: service('transition'),

  apiPath: 'apis.personnelDocumentsUploadCOA',
  previewRequired: true,
  sectionName: 'Collaborators and Other Affiliations',
  sectionKey: 'COA',

  init(...args) {
    this.set('allowableFileTypes', ['.xlsx']); // validate only xlsx
                                               // place before call to this._super to pass allowableFileTypes
                                               // property value to parent init method
    this._super(...args);
  },
  convertedFileType: '.pdf',

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
