import Mirage from 'ember-cli-mirage';

export default Mirage.Factory.extend({

  id(i) { return i; },
  description(i) { return `Division ${i}`; },
  // code(i) { return `CODE-${i}`; },
  // programs(i) {return [`${i}`, `${i+1}`];}
  programs(i) {return [`${i}`, `${i+1}`];}

});
