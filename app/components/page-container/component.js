import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({
  institutionInfoText: 'The Awardee Organization Name displayed here can be changed from the Cover Sheet',
  descriptionFormatted: computed('description', function() {
    return `(${this.get('description')})`;
  })

});
