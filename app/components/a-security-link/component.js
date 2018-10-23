import Component from '@ember/component';
import { inject as service } from '@ember/service';

export default Component.extend({
  customForm: service(),
  tagName: 'span',
  classNames: ['a-security-container'],

  didReceiveAttrs() {
    this._super(...arguments);
    const isLeftAlign = this.get('isLeftAlign');
    this.buttonCSS = 'btn btn-default';
    this.buttonCSS += (isLeftAlign) ? ' form-control btn-align-left text-align-left btn-icon-wrap' : '';
  },

  actions: {
    openFile() {
      const onClick = this.get('onClick');
      // If onClick is specified use component to trigger an action only, not use the service directly
      if(onClick) {
        onClick();
        return;
      }
      this.get('customForm').postUrlUserToken(this.href);
    }
  }
});
