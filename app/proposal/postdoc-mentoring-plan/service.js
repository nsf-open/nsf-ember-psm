
import Service from '@ember/service';
import { inject as service } from '@ember/service';

export default Service.extend({
  api: service('api'),
  proposalDocumentService: service('proposal-document'),

  getPostDocFileInfo({propPrepId, propRevId}) {
    return this.get('proposalDocumentService').getFileInfo({apiPath: 'apis.fileUpload', propPrepId, propRevId, sectionCode: '15'});
  }
});
