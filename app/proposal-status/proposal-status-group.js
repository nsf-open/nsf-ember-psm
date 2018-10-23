import Object from '@ember/object';

const ProposalStatusGroup = Object.extend({
  title: '',

  init(...args) {
    this._super(...args);

    const statuses = this.get('statuses') || [];
    this.set('statuses', statuses);
  }
});

export default ProposalStatusGroup;
