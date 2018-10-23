import Component from '@ember/component';

import IndicatorType from './indicator-type';

export default Component.extend({
  tagName: 'span',
  init(...args) {
    this._super(...args);

    if (this.type === IndicatorType.New) {
      this.contextualClass = 'info';
      this.text = 'New';
    }
    else if (this.type === IndicatorType.UpdatesSaved) {
      this.contextualClass = 'success green-success';
      this.text = 'Updates Saved';
    }
    else if (this.type === IndicatorType.RevisionSaved) {
      this.contextualClass = 'success green-success';
      this.text = 'Revision Saved';
    }
    else if (this.type === IndicatorType.UpdatesNeeded) {
      this.contextualClass = 'warning';
      this.text = 'Updates Needed';
    }
    else if (this.type === IndicatorType.NotCompliant) {
      this.contextualClass = 'danger';
      this.text = 'Not Compliant';
    }
  }
});
