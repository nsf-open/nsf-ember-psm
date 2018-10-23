import Route from '@ember/routing/route';

export default Route.extend({

  activate () {
    window.scrollTo(0, 0);
  },

});
