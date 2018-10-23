import Service from '@ember/service';

export default Service.extend({
  loadingTransition: null,
  ajaxInProgress: false,

  abortResetLoadingTransition() {
    const loadingTransition = this.get('loadingTransition');
    if (!loadingTransition) return;

    loadingTransition.abort();
    this.resetLoadingTransition();
  },

  setLoadingTransition(transition) {
    if (transition && this.ajaxInProgress) {
      transition.abort(); // -- If you're currently uploading then don't allow the transition to continue
      throw new Error('Cannot change transition when an important ajax request is in-progress.');
    }

    this.set('loadingTransition', transition);
  },

  setAjaxInProgress(ajaxInProgress) {
    this.ajaxInProgress = ajaxInProgress;
  },

  resetLoadingTransition() {
    this.setLoadingTransition(null);
  }
});
