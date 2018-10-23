import Ember from "ember";

export default Ember.Test.registerAsyncHelper('waitForModalOpen', function(app, modal) {
  return Ember.Test.promise(function(resolve, reject) {
    return modal.on('shown.bs.modal', function() {
      return resolve();
    });
  });
});
