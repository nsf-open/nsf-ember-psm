import Component from '@ember/component';

export default Component.extend({

  willRender() {
    this._super(...arguments);
    window.scroll(0, 0);
  }

});
