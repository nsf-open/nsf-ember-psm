import { computed } from '@ember/object';
import Object from '@ember/object';

const amountPattern = /^((,)*\d(,)*){0,8}$/;

function isEmpty(str) {
  return (!str || str.length === 0 || /^\s*$/.test(str));
}

export default Object.extend({

  name: null,
  nameError: null,
  serializedField: null,

  prices: computed(function() {
    return [{value: '0', valueError: null}];
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
      pricesToPush.push({value: initPrices[i].value, valueError: null});
    }
    this.set('prices', pricesToPush);
  },

  getInnerSum(total, price) {
    let value;

    if (isNaN(total)) {
      return 'Error';
    }
    if (isEmpty(price.value)) {
      value = 0;
    }
    else if (amountPattern.test(price.value)) {
      value = price.value.replace(/,/g, '');
      value = parseInt(value, 10);
    }
    else {
      return 'Error';
    }
    return total + value;
  },

  addYear() {
    this.get('prices').pushObject({value: '0', valueError: null});
  },

  copyYear(yearToCopy) {
    const copyValue = this.get('prices')[yearToCopy - 1].value;
    const copyValueError = this.get('prices')[yearToCopy - 1].valueError;
    this.get('prices').pushObject({value: copyValue, valueError: copyValueError});
  },

  deleteYear(yearToDelete) {
    this.get('prices').removeAt(yearToDelete - 1);
  },

  getErrorList() {
    const errorListToReturn = [];
    for (let i = 0; i < this.get('prices').length; i += 1) {
      if (this.get('prices')[i].monthError) {
        errorListToReturn.push({'errorText': this.get('prices')[i].monthError, 'errorYear': (i + 1)});
      }
      if (this.get('prices')[i].valueError) {
        errorListToReturn.push({'errorText': this.get('prices')[i].valueError, 'errorYear': (i + 1)});
      }
      if (this.get('prices')[i].nameError) {
        errorListToReturn.push({'errorText': this.get('prices')[i].nameError, 'errorYear': (i + 1)});
      }
      if (this.get('prices')[i].personError) {
        errorListToReturn.push({'errorText': this.get('prices')[i].personError, 'errorYear': (i + 1)});
      }
      if (this.get('prices')[i].rateError) {
        errorListToReturn.push({'errorText': this.get('prices')[i].rateError, 'errorYear': (i + 1)});
      }
      if (this.get('prices')[i].baseError) {
        errorListToReturn.push({'errorText': this.get('prices')[i].baseError, 'errorYear': (i + 1)});
      }
    }
    if (this.get('nameError')) {
      errorListToReturn.push({'errorText': this.get('nameError'), 'errorYear': 1});
    }
    return errorListToReturn;
  },

});
