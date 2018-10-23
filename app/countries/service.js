import Service from '@ember/service';
import { inject as service } from '@ember/service';
import { hash } from 'rsvp';

export default Service.extend({
  api: service('api'),
  props: service('properties'),
  lookups: service('lookups'),

  countries: null,
  states: null,

  getAllCountries() {
    return this.countries;
  },

  getAllStates() {
    return this.states;
  },

  getInternationalCountries() {
    function countryIsInternational(country) {
      const domesticCountryCodes = ['US'];
      const countryCode = country.countryCode;
      const isCountryInternational = domesticCountryCodes.indexOf(countryCode) === -1;
      return isCountryInternational;
    }

    return this.countries.filter(countryIsInternational);
  },

  loadCountriesStates() {
    if (this.countries && this.states) {
      return true; // if countries and states are populated then return boolean
    }

    return hash({
      countries: this.get('api').httpGet('apis.constants.countries'),
      states: this.get('api').httpGet('apis.constants.states')
    }).then((hash) => {
      this.countries = hash.countries.countries;
      this.states = hash.states.states;
    });
  }
});
