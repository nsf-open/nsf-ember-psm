import Mirage from 'ember-cli-mirage';

export default Mirage.Factory.extend({
  id(i) { return i; },
  tempPropId(i) { return  i; },
  content(i) { return `I am the ${i} Data Management Plan.`;}

});
