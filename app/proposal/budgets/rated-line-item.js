import { computed } from '@ember/object';
import LineItem from './line-item';

const calculationErrorMessage = 'Error';

const ratePattern = /^\d{0,3}(\.\d{0,2})?$/;
// let ratePattern = /^(\d{1,2}|\d{0,2}\.\d{0,2}|100(\.0{0,2})?)$/;
const amountPattern = /^((,)*\d(,)*){0,8}$/;

function isEmpty(str) {
  return (!str || str.length === 0 || /^\s*$/.test(str));
}

function calculateValue(rate, base) {
  if ((!isEmpty(rate) && !ratePattern.test(rate)) || (!isEmpty(base) && !amountPattern.test(base))) {
    return calculationErrorMessage;
  }
  if (isEmpty(base)) {
    base = 0;
  }
  else if (amountPattern.test(base)) {
    base = base.replace(/,/g, '');
    base = parseInt(base, 10);
  }

  rate = (isEmpty(rate)) ? 0 : parseFloat(rate);

  return Math.round((rate / 100) * base);
}

export default LineItem.extend({
  prices: computed(function() {
    return [{
      rate: '0.00',
      base: '0',
      value: computed('rate', 'base', function() { return calculateValue(this.rate, this.base); }),
      rateError: null,
      baseError: null
    }];
  }),

  total: computed('prices.{[],@each.value}', function() {
    return this.get('prices').reduce(this.getInnerSum, 0);
  }),

  initializePrices(initPrices) {
    const pricesToPush = [];
    for (let i = 0; i < initPrices.length; i += 1) {
      if (!this.get('prices')[i]) {
        this.addYear();
      }
      pricesToPush.push({rate: initPrices[i].rate, base: initPrices[i].base, value: computed('rate', 'base', function() { return calculateValue(this.rate, this.base); }), rateError: null, baseError: null});
    }
    this.set('prices', pricesToPush);
  },

  getInnerSum(total, price) {
    if (isNaN(total)) {
      return calculationErrorMessage;
    }

    const rate = price.rate;
    const base = price.base;

    const value = calculateValue(rate, base);

    if (isNaN(value)) { return calculationErrorMessage; }

    return total + value;
  },

  addYear() {
    this.get('prices').pushObject({
      rate: '0.00',
      base: '0',
      value: computed('rate', 'base', function() { return calculateValue(this.rate, this.base); }),
      rateError: null,
      baseError: null
    });
  },
  copyYear(yearToCopy) {
    const copyRate = this.get('prices')[yearToCopy - 1].rate;
    const copyBase = this.get('prices')[yearToCopy - 1].base;

    const copyRateError = this.get('prices')[yearToCopy - 1].rateError;
    const copyBaseError = this.get('prices')[yearToCopy - 1].baseError;
    this.get('prices').pushObject({
      rate: copyRate,
      base: copyBase,
      value: computed('rate', 'base', function() { return calculateValue(this.rate, this.base); }),
      rateError: copyRateError,
      baseError: copyBaseError
    });
  }
});
