import Mirage from 'ember-cli-mirage';

export default Mirage.Factory.extend({
  id(i) { return i; },
  tempPropId(i) { return  i; },
  proposalTitle(i) { return `Proposal Title ${i}`; },
  coverSheet(i) {return i;}
});
