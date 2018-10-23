import Component from '@ember/component';

export default Component.extend({

  actions: {
    exitWizard() {
      this.get('exitWizard')(); // send action to the wizard controller
    }
  }

});
