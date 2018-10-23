import Mirage from 'ember-cli-mirage';

export default Mirage.Factory.extend({

  id(i) { return i; },
  description(i) { return `Program ${i}`; }

});
