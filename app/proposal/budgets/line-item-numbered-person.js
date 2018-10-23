import { computed } from '@ember/object';
import MonthLineItem from './line-item-month';

const personnelPattern = /^((,)*\d(,)*){0,4}$/;

function isEmpty(str) {
  return (!str || str.length === 0 || /^\s*$/.test(str));
}

export default MonthLineItem.extend({

  prices: computed(function() {
    // return [{persons: null, months:null, value: null, personError:null, monthError: null, valueError: null}];
    return [{persons: '0', months: '0.00', value: '0', personError: null, monthError: null, valueError: null}];
  }),

  initializePrices(initPrices) {
    const pricesToPush = [];
    for (let i = 0; i < initPrices.length; i += 1) {
      if (!this.get('prices')[i]) {
        this.addYear();
      }
      pricesToPush.push({persons: initPrices[i].count, months: initPrices[i].months, value: initPrices[i].value, personError: null, monthError: null, valueError: null});
    }
    this.set('prices', pricesToPush);
  },

  addYear() {
    this.get('prices').pushObject({persons: '0', months: '0.00', value: '0', personError: null, monthError: null, valueError: null});
  },

  copyYear(yearToCopy) {
    const copyPersons = this.get('prices')[yearToCopy - 1].persons;
    const copyMonths = this.get('prices')[yearToCopy - 1].months;
    const copyValue = this.get('prices')[yearToCopy - 1].value;

    const copyPersonError = this.get('prices')[yearToCopy - 1].personError;
    const copyMonthError = this.get('prices')[yearToCopy - 1].monthError;
    const copyValueError = this.get('prices')[yearToCopy - 1].valueError;


    this.get('prices').pushObject({persons: copyPersons, months: copyMonths, value: copyValue, personError: copyPersonError, monthError: copyMonthError, valueError: copyValueError});
  },

  personTotal: computed('prices.{[],@each.persons}', function() {
    return this.get('prices').reduce(this.getInnerPersonSum, 0);
  }),
  getInnerPersonSum(total, price) {
    let value;

    if (isNaN(total)) {
      return 'Error';
    }
    if (isEmpty(price.persons)) {
      value = 0;
    }
    else if (personnelPattern.test(price.persons)) {
      value = price.persons.replace(/,/g, '');
      value = parseInt(value, 10);
    }
    else {
      return 'Error';
    }
    return total + value;
  }

});
