import Mirage from 'ember-cli-mirage';

export default Mirage.Factory.extend({

  fundingOpportunityId(i) { return `NSF-${i}`; },
  fundingOpportunityTitle(i) { return `Funding Opportunity ${i}`; },

});
