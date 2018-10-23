import Mirage from 'ember-cli-mirage';

export default Mirage.Factory.extend({
  id(i) { return i; },
  name(i) { return  `Name ${i}`; },
  role(i) { return i; },
  organization(i) { return i; },
  biosketch(i) { return i; },
  assistant(i) { return i; }
});
