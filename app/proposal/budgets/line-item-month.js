import { computed } from '@ember/object';
import LineItem from './line-item';

const monthPattern = /^(\d?(\.\d{0,2})?|[1][0-1](\.\d{0,2})?|[1][2](\.[0]{1,2})?)$/;

function isEmpty(str) {
  return (!str || str.length === 0 || /^\s*$/.test(str));
}

export default LineItem.extend({

  prices: computed(function() {
    return [{months: '0.00', value: '0', monthError: null, valueError: null}];
  }),

  initializePrices(initPrices) {
    const pricesToPush = [];
    for (let i = 0; i < initPrices.length; i += 1) {
      if (!this.get('prices')[i]) {
        this.addYear();
      }
      pricesToPush.push({months: initPrices[i].months, value: initPrices[i].value, monthError: null, valueError: null});
    }
    this.set('prices', pricesToPush);
  },
  addYear() {
    this.get('prices').pushObject({months: '0.00', value: '0', monthError: null, valueError: null});
  },
  copyYear(yearToCopy) {
    const copyMonths = this.get('prices')[yearToCopy - 1].months;
    const copyValue = this.get('prices')[yearToCopy - 1].value;

    const copyMonthError = this.get('prices')[yearToCopy - 1].monthError;
    const copyValueError = this.get('prices')[yearToCopy - 1].valueError;

    this.get('prices').pushObject({months: copyMonths, value: copyValue, monthError: copyMonthError, valueError: copyValueError});
  },
  hasData() {
    const prices = this.get('prices');
    for (let i = 0; i < prices.length; i += 1) {
      if (prices[i].months != '0.00' || prices[i].value != '0') {
        return true;
      }
    }
    return false;
  },
  clearData() {
    const numYears = this.get('prices').length;
    const pricesToPush = [];
    for (let i = 0; i < numYears; i += 1) {
      pricesToPush.push({months: '0.00', value: '0', monthError: null, valueError: null});
    }
    this.set('prices', pricesToPush);
  },
  monthTotal: computed('prices.{[],@each.months}', function() {
    return this.get('prices').reduce(this.getInnerMonthSum, 0);
  }),
  getInnerMonthSum(total, price) {
    let value;

    if (isNaN(total)) {
      return 'Error';
    }
    if (isEmpty(price.months)) {
      value = 0;
    }
    else if (monthPattern.test(price.months)) {
      value = parseFloat(price.months.toString());
    }
    else {
      return 'Error';
    }
    return total + value;
  },

});
