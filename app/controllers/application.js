import Controller from '@ember/controller';
import { inject as service } from '@ember/service';

export default Controller.extend({

  session: service('session'),
  props: service('properties'),
  webtrendsService: service('webtrend-analytics')
});