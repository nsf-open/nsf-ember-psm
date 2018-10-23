import Component from '@ember/component';

export default Component.extend({

  didInsertElement() {
    this._super(...arguments);
    this.set('componentId', this.element.id);
  },

  actions: {
    confirmExit() {
      this.get('exitConfirmAction')();
    },
    cancelExit() {
      this.get('exitCancelAction')();
    }
  }

});
