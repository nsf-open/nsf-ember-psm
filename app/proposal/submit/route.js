import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { hash } from 'rsvp';
import { set } from '@ember/object';

export default Route.extend({
  activeUser: service('active-user'),
  messageService: service('messages'),
  permissions: service('permissions'),
  proposalService: service('proposal'),
  props: service('properties'),

  beforeModel() {
    this.controllerFor('proposal.submit').set('isLoading', true);

    const proposal = this.modelFor('proposal');
    const { propPrepId, propRevId } = proposal;

    this.get('proposalService').getProposalAccess({ propPrepId, propRevId }).then((data) => {
      if (!this.get('permissions').hasPermission('proposal.submit') || (data.proposalPackage.proposalStatus !== '04' && data.proposalPackage.proposalStatus !== '11' && data.proposalPackage.proposalStatus !== '16')) {
        return this.transitionTo('proposal');
      }
    });

  },

  model() {
    const proposal = this.modelFor('proposal');
    const { propPrepId, propRevId } = proposal;

    return hash({
      responsePackage: this.get('proposalService').getElectronicSign({ propPrepId, propRevId })
    }).then((hash) => {
      hash.propPrepId = proposal.propPrepId;
      hash.propRevId = proposal.propRevId;
      hash.proposalPackageData = hash.responsePackage.responsePackage;
      hash.coverSheetData = hash.responsePackage.coverSheet;
      hash.electronicCertificationText = hash.responsePackage.electronicCertificationText;
      hash.isPFUStatus = proposal.get('isInPFUStatus');
      return hash;
    });
  },

  activate () {
    window.scrollTo(0, 0);
  },

  renderTemplate(controller) {
    this.render('proposal.submit', {into: 'proposal', outlet: 'noMenu', controller});
  },
  setupController(controller, model) {
    this._super(controller, model);
    controller.reInit();
    set(this.controllerFor('proposal'), 'showMenu', false);
  },
  actions: {
    willTransition() {
      this.get('messageService').clearScreenMessages();

      set(this.controllerFor('proposal'), 'showMenu', true);
      return true;
    }
  }

});
