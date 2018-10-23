import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';


export default Route.extend({
  srPersonnelService: service('proposal/sr-personnel-documents'),

  model() {
    const srPersonnelDocuments = this.modelFor('proposal.sr-personnel-documents');
    const propID = srPersonnelDocuments.propPrepId;
    const revID = srPersonnelDocuments.propRevId;

    return this.get('srPersonnelService').getPersonnelInfo({propID, revID}).then(hash => {
      return Object.assign({}, hash, { documents:srPersonnelDocuments });
    });
  },
  afterModel() {
    const controller = this.controllerFor('proposal.sr-personnel-documents.index');
    controller.set('personnelDataLoading', false);
  }

});
