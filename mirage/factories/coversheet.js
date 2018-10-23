import Mirage from 'ember-cli-mirage';

export default Mirage.Factory.extend({
  id(i) { return i; },
  tempPropId(i) { return  i; },
  // proposalTitle(i) { return `Proposal Title ${i+1}`; }

  content(i) { return `I am the ${i} Cover Sheet.`;},

  fundingMechanism(i) { return `Funding Mechanism ${i}`; },
  requestedBudgetAmount(i) { return i+100; },
  submissionDate() {return new Date();}

});
