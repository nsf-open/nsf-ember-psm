import { moduleFor, test } from 'ember-qunit';
import Service from '@ember/service';

import LineItem from 'psm/proposal/budgets/line-item';
import MonthLineItem from 'psm/proposal/budgets/line-item-month';
import NumberedPersonLineItem from 'psm/proposal/budgets/line-item-numbered-person';
import RatedLineItem from 'psm/proposal/budgets/rated-line-item';

const budgetServiceStub = Service.extend({
  init(...args) {
    this._super(...args);
  }
});

moduleFor('controller:proposal/budgets', 'Unit | Controller | proposal/budgets', {
  needs: ['service:properties', 'service:resolution', 'service:customForm', 'service:activeUser', 'service:messages', 'service:permissions', 'service:proposal-constants', 'service:section-lookup', 'service:webtrend-analytics'],
  beforeEach() {
    this.register('service:proposal/budgets', budgetServiceStub);
    this.inject.service('proposal/budgets', { as: 'budgetService' });
  }
});

// Test controller exists
test('it exists', function(assert) {
  const controller = this.subject();
  assert.ok(controller);
});

// Test controller breadcrumb is set
test('breadcrumb set', function(assert) {
  const controller = this.subject();
  assert.equal(controller.breadCrumb, 'Budget(s)');
});

// Test some computed properties
test('computed properties', function(assert) {
  const controller = this.subject();

  assert.equal(controller.get('showLeftSlider'), false);
  assert.equal(controller.get('showRightSlider'), false);
  assert.equal(controller.get('slidersShown'), false);

  controller.send('addYear');
  controller.send('addYear');
  controller.send('addYear');
  controller.send('addYear');

  assert.equal(controller.get('showLeftSlider'), true);
  assert.equal(controller.get('showRightSlider'), true);
  assert.equal(controller.get('slidersShown'), true);
});

// Test initializing Budget Data
test('initialize budget data', function(assert) {
  const controller = this.subject();

  controller.initBudgetYears();

  assert.equal(controller.get('seniorPersonnel').length, 1);
});

// Test year defaults and adding a year
test('year add', function(assert) {
  const controller = this.subject();

  assert.equal(controller.get('years').length, 1);
  assert.equal(controller.get('deleteYearDisabled'), true);

  controller.send('addYear');

  assert.equal(controller.get('years').length, 2);
  assert.equal(controller.get('deleteYearDisabled'), false);

  controller.send('addYear');

  assert.equal(controller.get('years').length, 3);
  assert.equal(controller.get('deleteYearDisabled'), false);

  assert.equal(controller.get('isBudgetModified'), false);
  controller.send('addYear');
  assert.equal(controller.get('isBudgetModified'), false);
  controller.send('addYearProxy');
  assert.equal(controller.get('isBudgetModified'), true);
});

// Test deleting a year
test('year delete', function(assert) {
  const controller = this.subject();

  assert.equal(controller.get('years').length, 1);
  assert.equal(controller.get('deleteYearDisabled'), true);

  controller.send('addYear');

  assert.equal(controller.get('years').length, 2);
  assert.equal(controller.get('deleteYearDisabled'), false);

  controller.set('selectedDeleteYear', 1);
  controller.send('deleteYear');

  assert.equal(controller.get('years').length, 1);
  assert.equal(controller.get('deleteYearDisabled'), true);
});

// Test Budget addMessage
test('messages tests', function(assert) {
  const controller = this.subject();

  // regular messages
  assert.equal(controller.get('messageService').messages.length, 0);

  controller.get('messageService').addMessage({status: 'error', dismissable: true, message: 'Test Warning Message'});

  assert.equal(controller.get('messageService').messages.length, 1);

  controller.get('messageService').clearActionMessages();

  assert.equal(controller.get('messageService').messages.length, 0);

  controller.get('messageService').addMessage({status: 'error', dismissable: true, message: 'Test Warning Message 1'});
  controller.get('messageService').addMessage({status: 'info', dismissable: true, message: 'Test Info Message'});
  controller.get('messageService').addMessage({status: 'error', dismissable: true, message: 'Test Warning Message 2'});
  controller.get('messageService').addMessage({status: 'success', dismissable: true, message: 'Test Success Message'});

  assert.equal(controller.get('messageService').messages.length, 4);
  controller.send('clearInfoMessages');
  assert.equal(controller.get('messageService').messages.length, 3);
  controller.send('clearSuccessMessages');
  assert.equal(controller.get('messageService').messages.length, 2);
});

// Test Budget format functions
test('format functions', function(assert) {
  const controller = this.subject();

  // monthFormat
  const emberMonthsObj = {months: '0.'};
  controller.send('monthFormat', emberMonthsObj);
  assert.equal(emberMonthsObj.months, '0.00');
  emberMonthsObj.months = '0';
  controller.send('monthFormat', emberMonthsObj);
  assert.equal(emberMonthsObj.months, '0.00');
  emberMonthsObj.months = '';
  controller.send('monthFormat', emberMonthsObj);
  assert.equal(emberMonthsObj.months, '0.00');
  emberMonthsObj.months = '0.0';
  controller.send('monthFormat', emberMonthsObj);
  assert.equal(emberMonthsObj.months, '0.00');

  // rateFormat
  const emberRateObj = {rate: '0.'};
  controller.send('rateFormat', emberRateObj);
  assert.equal(emberRateObj.rate, '0.00');
  emberRateObj.rate = '0';
  controller.send('rateFormat', emberRateObj);
  assert.equal(emberRateObj.rate, '0.00');
  emberRateObj.rate = '';
  controller.send('rateFormat', emberRateObj);
  assert.equal(emberRateObj.rate, '0.00');
  emberRateObj.rate = '0.0';
  controller.send('rateFormat', emberRateObj);
  assert.equal(emberRateObj.rate, '0.00');
});

// Test a line-item
test('line-item object tests', function(assert) {
  const newLineItem = LineItem.create();
  assert.equal(newLineItem.getInnerSum('Error', 0), 'Error');
  assert.equal(newLineItem.getInnerSum(0, {value: ''}), 0);
  assert.equal(newLineItem.getInnerSum(10, {value: -10}), 'Error');

  const initPricesArray = [{value: '10'}, {value: '500'}];
  newLineItem.initializePrices(initPricesArray);

  assert.equal(newLineItem.prices.length, 2);
  assert.equal(newLineItem.get('total'), 510);

  newLineItem.addYear();
  assert.equal(newLineItem.prices.length, 3);

  newLineItem.deleteYear();
  assert.equal(newLineItem.prices.length, 2);

  newLineItem.copyYear(1);
  assert.equal(newLineItem.prices.length, 3);

  assert.equal(newLineItem.getErrorList().length, 0);
  newLineItem.prices[0].monthError = 'Test monthError';
  newLineItem.prices[0].valueError = 'Test valueError';
  newLineItem.prices[0].nameError = 'Test nameError';
  newLineItem.prices[0].personError = 'Test personError';
  newLineItem.prices[0].rateError = 'Test rateError';
  newLineItem.prices[0].baseError = 'Test baseError';
  newLineItem.nameError = 'Test root nameError';
  assert.equal(newLineItem.getErrorList().length, 7);
});

// Test a line-item-month
test('line-item-month object tests', function(assert) {
  const newLineItemMonth = MonthLineItem.create();
  assert.equal(newLineItemMonth.getInnerMonthSum('Error', 0), 'Error');
  assert.equal(newLineItemMonth.getInnerMonthSum(0, {months: ''}), 0);
  assert.equal(newLineItemMonth.getInnerMonthSum(10, {months: -10}), 'Error');
  assert.equal(newLineItemMonth.hasData(), false);

  const initPricesArray = [{value: '10', months: '1'}, {value: '500', months: '2'}];
  newLineItemMonth.initializePrices(initPricesArray);
  assert.equal(newLineItemMonth.hasData(), true);

  assert.equal(newLineItemMonth.prices.length, 2);
  assert.equal(newLineItemMonth.get('total'), 510);
  assert.equal(newLineItemMonth.get('monthTotal'), 3);

  newLineItemMonth.addYear();
  assert.equal(newLineItemMonth.prices.length, 3);

  newLineItemMonth.copyYear(1);
  assert.equal(newLineItemMonth.prices.length, 4);

  newLineItemMonth.clearData();
  assert.equal(newLineItemMonth.get('total'), 0);
});

// Test a line-item-numbered-person
test('line-item-numbered-person object tests', function(assert) {
  const newLineItemNumberedPerson = NumberedPersonLineItem.create();
  assert.equal(newLineItemNumberedPerson.getInnerPersonSum('Error', 0), 'Error');
  assert.equal(newLineItemNumberedPerson.getInnerPersonSum(0, {persons: ''}), 0);
  assert.equal(newLineItemNumberedPerson.getInnerPersonSum(10, {persons: -10}), 'Error');

  const initPricesArray = [{value: '10', months: '1', count: '1'}, {value: '500', months: '2', count: '3'}];
  newLineItemNumberedPerson.initializePrices(initPricesArray);

  assert.equal(newLineItemNumberedPerson.prices.length, 2);
  assert.equal(newLineItemNumberedPerson.get('total'), 510);
  assert.equal(newLineItemNumberedPerson.get('personTotal'), 4);

  newLineItemNumberedPerson.addYear();
  assert.equal(newLineItemNumberedPerson.prices.length, 3);

  newLineItemNumberedPerson.copyYear(1);
  assert.equal(newLineItemNumberedPerson.prices.length, 4);
});

// Test a rated-line-item
test('rated-line-item object tests', function(assert) {
  const newRatedLineItem = RatedLineItem.create();
  assert.equal(newRatedLineItem.getInnerSum('Error', 0), 'Error');
  assert.equal(newRatedLineItem.getInnerSum(0, {rate: '0', base: '0'}), 0);

  const initPricesArray = [{rate: '10', base: '1'}, {rate: '500', base: '2'}];
  newRatedLineItem.initializePrices(initPricesArray);

  assert.equal(newRatedLineItem.prices.length, 2);
  assert.equal(newRatedLineItem.get('total'), 10);

  newRatedLineItem.addYear();
  assert.equal(newRatedLineItem.prices.length, 3);

  newRatedLineItem.copyYear(1);
  assert.equal(newRatedLineItem.prices.length, 4);
});
