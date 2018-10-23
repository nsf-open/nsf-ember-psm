import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import { set } from '@ember/object';
import { get } from '@ember/object';
import { observer } from '@ember/object';
import { later } from '@ember/runloop';

import LineItem from './line-item';
import MonthLineItem from './line-item-month';
import NumberedPersonLineItem from './line-item-numbered-person';
import RatedLineItem from './rated-line-item';
import $ from 'jquery';

const calculationErrorMessage = 'Error';
const ratePattern = /^\d{0,3}(\.\d{0,2})?$/;
const moreThanThreeDecimalsPattern = /^\d*(\.\d{3,})$/;
const twoDecimals = /\.{1}.*\.{1}/;

const monthPattern = /^(\d?(\.\d{0,2})?|[1][0-1](\.\d{0,2})?|[1][2](\.[0]{1,2})?)$/;
const amountPattern = /^((,)*\d(,)*){0,8}$/;
const personnelPattern = /^((,)*\d(,)*){0,4}$/;

const digitsCommasPattern = /^(\d*|,*)*$/;
const digitsDecimalsPattern = /^(\d*|\.*)*$/;
const digitsDecimalsCommasPattern = /^(\d*|,*|\.*)*$/;

const hasDecimalPattern = /^(.*\..*)*$/;

const nameAllowableCharactersPattern = /^([a-zA-Z\d!#&(),./:;\-%@$+<=>_ ])*$/;

function isEmpty(str) {
  return (!str || str.length === 0 || /^\s*$/.test(str));
}

function capitalizeFirstLetter(string) {
  string = string.toLowerCase().replace(/\b[a-z]/, function(letter) {
    return letter.toUpperCase();
  });
  return string;
}

function capitalizeFirstLetters(string) {
  string = string.toLowerCase().replace(/\b[a-z]/g, function(letter) {
    return letter.toUpperCase();
  });
  return string;
}

function removeLeadingTrailingZeros(emberObject, content, propertyToUpdate) { // rate & month formatting
  if (!isEmpty(content)) { content = parseFloat(content.toString()); }// Remove leading trail zeros
  if (!isNaN(content)) {
    if (propertyToUpdate) {
      set(emberObject, propertyToUpdate, content);
    }
    else {
      set(emberObject, 'value', content);
    }
  }
  return content;
}

function checkNameForErrors(content, emberObject, section) {
  if (isEmpty(content)) { // if empty, remove error
    set(emberObject, 'nameError', null);
  }
  else if (!nameAllowableCharactersPattern.test(content)) {
    set(emberObject, 'nameError', `${capitalizeFirstLetter(section)} name cannot include this special character`);
  }
  else {
    set(emberObject, 'nameError', null);
  }
}

function removeCommasForNumber(content) {
  if (!content) { return content; }
  content = content.replace(/,/g, '');
  return content;
}
function addCommasForNumber(content) {
  content = content.toString().replace(/\B(?=(?:\d{3})+(?!\d))/g, ',');
  return content;
}

export default Controller.extend({
  activeUser: service('active-user'),
  analytics: service('webtrend-analytics'),
  budgetService: service('proposal/budgets'),
  customForm: service(),
  messageService: service('messages'),
  permissions: service('permissions'),
  PROPOSAL_CONSTANTS: service('proposal-constants'),
  props: service('properties'),
  resolution: service('resolution'),
  sectionLookup: service('section-lookup'),

  addType: null,
  breadCrumb: 'Budget(s)',
  budget: null,
  budgetDataLoading: false, // use to track whether table data is loading
  copyYear: null,
  exitBudgetTransition: null, // use this to store a temporary transition object if user needs to confirm
  firstYearSelectedTitle: 'No additional years are available',
  isBudgetModified: false, // use isBudgetModified to detect changes on budget fields
  isBudgetPersonnelModified: false,
  isFormSubmission: true,
  institutionInfo: true,
  isSaving: false,
  lastYearSelectedTitle: 'No additional years are available',
  maxBudgetYears: 15,
  nextYearTitle: 'Next Year',
  previousYearTitle: 'Previous Year',
  proposalMenuStatus: 'open',
  sectionKey: 'BUDGETS',
  selectedDeleteYear: null,
  shownYearsEnd: 1, // starts at 0(index)/1(year), or something else that comes from the service
  yearWarningShown: null, // use to track info message about too many years - so we don't over-use the message

  init(...args) {
    this._super(...args);

    this.set('messageTexts', {
      'success_upload': 'Your budget has saved successfully.',
      'fail_live_validations': 'The form contains ${errorCount} errors, which are indicated below. Click each error icon to view the details, then please update the form and try saving again.',
      'fail_live_validations_one': 'The form contains 1 error, which is indicated below. Click the error icon to view the details, then please update the form and try saving again.',
      'fail_live_validations_generic': 'The form contains error(s), which are indicated below. Click each error icon to view the details, then please update the form and try saving again.',
      'fail_live_validations_additional': 'Additional error(s) are noted directly on the form below. Please click each error icon to see the details.',
      'fail_timeout': 'The budget save timed out.',
      'fail_print': 'A preview cannot be generated until error(s) on the form are fixed, which are indicated below ${yearNums}. Click each error icon to view the details, then please update the form and try saving again.',
      'fail_generic': this.get('PROPOSAL_CONSTANTS').SYSTEM_ERROR.SAVE_BUDGET,
      'years_visible_info': "More years have been added than can fit in the table.  Click the arrows in the table headers or total rows to view the remaining years.   Total funds requested will continue to show the total for all years in the budget.   To view additional years simultaneously, you may hide the page's left navigation menu.",
      'warning_personnel_data': "Personnel you are about to remove have data in the budget, which will be lost. Click 'Update Budget Personnel' again to confirm your changes.",
      'success_updatePersonnel': 'The senior personnel shown in the budget have been successfully updated.',
      'title_text_no_personnel': 'There are no personnel to select',
      'title_text_no_personnel_selected': 'Select personnel first',
      'warning_copy_year_disable': 'To copy from an existing year, please ensure all errors are resolved in the budget year',
      'warning_copy_year': 'One or more years currently in your budget contain errors and cannot be copied until the errors are resolved',
      'info_postdoc': 'A postdoctoral mentoring plan is now required since funds have been indicated in the budget for Postdoctoral Scholars. This section is now available from your required proposal sections.',
      'info_budget_impact_statement': 'A Budget Impact Statement is now available in your proposal sections. The statement is required if the budget is being reduced by 10% or more from the amount originally proposed.'
    });

    this.groupText = {
      personnelDC: {
        sections: {
          fringeBenefits: 'Fringe Benefits',
          otherPersonnel: 'Other Personnel',
          seniorPersonnel: 'Senior Personnel'
        },
        categories: {
          funds: 'Fund Amount',
          personnel: 'Number of Personnel',
          months: 'Number of Months'
        }
      },
      additionalDC: {
        sections: {
          equipment: 'Equipment',
          travel: 'Travel',
          participantSC: 'Participant Support Costs',
          otherDirectCosts: 'Other Direct Costs'
        },
        categories: {
          funds: 'Fund Amount',
          participants: 'Number of Participants'
        }
      },
      indirectCosts: {
        sections: {
          indirect: 'Indirect Costs'
        },
        categories: {
          rates: 'Rate',
          base: 'Base'
        }
      }
    },

    this.postDoctInfo = {
      infoTitle: '',
      infoText: 'If funds are requested for Postdoctoral Scholars, a Postdoctoral Mentoring Plan will be required.'
    }
  },

  viewOnly: computed('permissions.permissions.[]', function() {
    return !this.get('permissions').hasPermission('proposal.budget.modify');
  }),

  sectionInfo: computed('sectionLookup.sectionInfo', function() {
    if (this.get('sectionLookup.sectionInfo') != null) {
      const sectionObject = this.get('sectionLookup.sectionInfo');
      this.set('sectionCode', sectionObject[this.get('sectionKey')].code);
    }
    return this.get('sectionLookup.sectionInfo');
  }),
  sectionCode: computed(function() {
    if (this.get('sectionLookup.sectionInfo') != null) {
      const sectionObject = this.get('sectionLookup.sectionInfo');
      return sectionObject[this.get('sectionKey')].code;
    }
    return null;
  }),

  isTablet: computed('', function() {
    return this.get('resolution').isTablet;
  }),
  observeIsTablet: observer('resolution.isTablet', function() {
    $('.tooltip').tooltip('hide').tooltip('show');
    if (this.get('resolution').isTablet) {
      this.set('isTablet', true);
    }
    else {
      this.set('isTablet', false);
    }
  }),

  maxYearsShown: computed('isTablet', 'proposalMenuStatus', function() {
    if (this.get('isTablet')) {
      if (this.get('proposalMenuStatus') == 'open') {
        return 1;
      }
    }
    else if (this.get('proposalMenuStatus') == 'closed') {
      return 3;
    }
    return 2;
  }),

  toggleMenuEvent(menuStatus) {
    this.set('proposalMenuStatus', menuStatus);
    if (menuStatus == 'closed') {
      this.send('clearInfoMessages');
    }
    later(function() {
      $('.tooltip').tooltip('hide').tooltip('show');
    }, 700);
  },

  manageBudgetUpdateModalDisabled: computed('isBudgetPersonnelModified', function() {
    if (this.get('isBudgetPersonnelModified')) {
      return false;
    }
    return true;
  }),
  manageBudgetUpdateModalDisabledTitle: computed('manageBudgetUpdateModalDisabled', function() {
    if (this.get('manageBudgetUpdateModalDisabled')) {
      return 'There are no updates to make';
    }
    return '';
  }),

  addYearDisabled: computed('years.[]', function() {
    return this.get('years').length >= this.get('maxBudgetYears');
  }),
  addYearDisabledTitle: computed('addYearDisabled', function() {
    return this.get('addYearDisabled') ? 'You have added the maximum number of years permitted' : '';
  }),
  addYearModalButtonDisabled: computed('addType', 'copyYear', function() {
    if (this.get('addType') === 'blank') {
      return false;
    }
    else if (this.get('addType') === 'copy' && this.get('copyYear') !== null) {
      return false;
    }
    return true;
  }),
  addYearModalDisabledTitle: computed('addYearModalButtonDisabled', function() {
    return this.get('addYearModalButtonDisabled') ? 'A selection must be made first' : '';
  }),
  deleteYearDisabled: computed('years.[]', function() {
    return this.get('years').length <= 1;
  }),
  deleteYearDisabledTitle: computed('deleteYearDisabled', function() {
    return this.get('deleteYearDisabled') ? 'There must be a minimum of 1 year in the budget' : '';
  }),
  deleteYearModalButtonDisabled: computed('selectedDeleteYear', function() {
    return this.get('selectedDeleteYear') === null;
  }),
  deleteYearModalButtonTitle: computed('deleteYearModalButtonDisabled', function() {
    return this.get('deleteYearModalButtonDisabled') ? 'A year must be selected first' : '';
  }),

  /*
  set max 1 year if:
   - screen < 1200px and menu shown
  otherwise max 2 years
   */
  yearsShown: computed('years.[]', 'shownYearsEnd', 'maxYearsShown', function() {
    const maxYearsShown = this.get('maxYearsShown');
    const years = this.get('years');
    if (years.length <= maxYearsShown) {
      return years;
    }
    else { // return the years that are being show
      const shownYears = [];
      const shownYearsEnd = (this.get('shownYearsEnd') > years.length) ? years.length : this.get('shownYearsEnd');

      for (let i = 1; i <= maxYearsShown; i += 1) {
        shownYears.insertAt(0, years[shownYearsEnd - i]);
      }
      return shownYears;
    }
  }),

  // all the years in this budget, default to 1
  years: computed(function() {
    return [1];
  }),

  multipleYearsShown: computed('years.[]', 'maxYearsShown', function() {
    if (this.get('maxYearsShown') > 1 && this.get('years').length > 1) {
      return true;
    }
    return false;
  }),

  showLeftSlider: computed('shownYearsEnd', 'years.[]', 'maxYearsShown', function() {
    const leftControl = $('.col-slider a').find('.fa-angle-left').parent().parent();
    const leftControlAnchorParent = $('.col-slider a').find('.fa-angle-left').parent();
    const leftControlAnchorBenefitsParent = $('#total-left-benefits');
    const leftControlAnchorOtherParent = $('#total-left-other');
    const leftControlAnchorTotalParent = $('#total-left-total');
    const leftControlAnchor = $('.col-slider a').find('.fa-angle-left');
    const rightControl = $('.col-slider a').find('.fa-angle-right').parent().parent();
    const rightControlAnchorParent = $('.col-slider a').find('.fa-angle-right').parent();
    const rightControlAnchorBenefitsParent = $('#total-right-benefits');
    const rightControlAnchorOtherParent = $('#total-right-other');
    const rightControlAnchorTotalParent = $('#total-right-total');
    const rightControlAnchor = $('.col-slider a').find('.fa-angle-right');
    const previousYearTitle = this.get('previousYearTitle');
    const firstYearSelectedTitle = this.get('firstYearSelectedTitle');
    const nextYearTitle = this.get('nextYearTitle');
    const maxYearsShown = this.get('maxYearsShown');
    const shownYearsEnd = this.get('shownYearsEnd');
    leftControlAnchorParent.prop('class', 'enabled-slide');
    leftControlAnchorTotalParent.prop('class', 'enabled-slide-adjusted');
    if (shownYearsEnd == maxYearsShown) {
      leftControl.prop('disabled', true);
      leftControl.css('cursor', 'default');
      leftControl.css('text-decoration', 'none');
      leftControl.prop('title', firstYearSelectedTitle);
      leftControlAnchorParent.prop('class', 'disabled-slide');
      leftControlAnchorBenefitsParent.prop('class', 'disabled-slide-adjusted');
      leftControlAnchorOtherParent.prop('class', 'disabled-slide-adjusted');
      leftControlAnchorTotalParent.prop('class', 'disabled-slide-adjusted-total');
      leftControlAnchor.css('cursor', 'default');
      leftControlAnchor.css('text-decoration', 'none');
      leftControlAnchor.prop('title', firstYearSelectedTitle);
      if (rightControl != undefined && rightControlAnchor != undefined) {
        rightControl.prop('disabled', false);
        rightControl.css('cursor', 'pointer');
        rightControl.css('text-decoration', 'none');
        rightControl.prop('title', nextYearTitle);
        rightControlAnchorParent.prop('class', 'enabled-slide');
        rightControlAnchorBenefitsParent.prop('class', 'enabled-slide-adjusted');
        rightControlAnchorOtherParent.prop('class', 'enabled-slide-adjusted');
        rightControlAnchorTotalParent.prop('class', 'enabled-slide-adjusted-total');
        rightControlAnchor.css('cursor', 'pointer');
        rightControlAnchor.css('text-decoration', 'none');
        rightControlAnchor.prop('title', nextYearTitle);
      }
    }
    else if (maxYearsShown < this.get('years').length) {
      leftControl.prop('disabled', false);
      leftControl.css('cursor', 'pointer');
      leftControl.css('text-decoration', 'none');
      leftControl.prop('title', previousYearTitle);
      leftControlAnchorParent.prop('class', 'enabled-slide');
      leftControlAnchorTotalParent.prop('class', 'enabled-slide-adjusted');
      leftControlAnchorOtherParent.prop('class', 'enabled-slide-adjusted');
      leftControlAnchorTotalParent.prop('class', 'enabled-slide-adjusted-total');
      leftControlAnchor.css('cursor', 'pointer');
      leftControlAnchor.css('text-decoration', 'none');
      leftControlAnchor.prop('title', previousYearTitle);
    }
    return (this.get('years').length > maxYearsShown);
  }),

  showRightSlider: computed('shownYearsEnd', 'years.[]', 'maxYearsShown', function() {
    const leftControl = $('.col-slider a').find('.fa-angle-left').parent().parent();
    const leftControlAnchorParent = $('.col-slider a').find('.fa-angle-left').parent();
    const leftControlAnchorBenefitsParent = $('#total-left-benefits');
    const leftControlAnchorOtherParent = $('#total-left-other');
    const leftControlAnchorTotalParent = $('#total-left-total');
    const leftControlAnchor = $('.col-slider a').find('.fa-angle-left');
    const rightControl = $('.col-slider a').find('.fa-angle-right').parent().parent();
    const rightControlAnchorParent = $('.col-slider a').find('.fa-angle-right').parent();
    const rightControlAnchorBenefitsParent = $('#total-right-benefits');
    const rightControlAnchorOtherParent = $('#total-right-other');
    const rightControlAnchorTotalParent = $('#total-right-total');
    const rightControlAnchor = $('.col-slider a').find('.fa-angle-right');
    const previousYearTitle = this.get('previousYearTitle');
    const lastYearSelectedTitle = this.get('lastYearSelectedTitle');
    const nextYearTitle = this.get('nextYearTitle');
    const maxYearsShown = this.get('maxYearsShown');
    const years = this.get('years');
    const endYear = years[years.length - 1];
    const yearsShown = this.get('yearsShown');
    const currentYear = yearsShown[yearsShown.length - 1];
    rightControlAnchorParent.prop('class', 'enabled-slide');
    rightControlAnchorTotalParent.prop('class', 'enabled-slide-adjusted');
    if (rightControl != undefined && rightControlAnchor != undefined) {
      rightControl.prop('disabled', true);
      rightControl.css('cursor', 'default');
      rightControl.css('text-decoration', 'none');
      rightControl.prop('title', lastYearSelectedTitle);
      rightControlAnchorParent.prop('class', 'disabled-slide');
      rightControlAnchorBenefitsParent.prop('class', 'disabled-slide-adjusted');
      rightControlAnchorOtherParent.prop('class', 'disabled-slide-adjusted');
      rightControlAnchorTotalParent.prop('class', 'disabled-slide-adjusted-total');
      rightControlAnchor.css('cursor', 'default');
      rightControlAnchor.css('text-decoration', 'none');
      rightControlAnchor.prop('title', lastYearSelectedTitle);
    }
    if (this.get('years').length == this.get('shownYearsEnd')) {
      leftControl.prop('disabled', false);
      leftControl.css('cursor', 'pointer');
      leftControl.css('text-decoration', 'none');
      leftControl.prop('title', previousYearTitle);
      leftControlAnchorParent.prop('class', 'enabled-slide');
      leftControlAnchorBenefitsParent.prop('class', 'enabled-slide-adjusted');
      leftControlAnchorOtherParent.prop('class', 'enabled-slide-adjusted');
      leftControlAnchorTotalParent.prop('class', 'enabled-slide-adjusted-total');
      leftControlAnchor.css('cursor', 'pointer');
      leftControlAnchor.css('text-decoration', 'none');
      leftControlAnchor.prop('title', previousYearTitle);
    }
    else if (currentYear < endYear) {
      rightControl.prop('disabled', false);
      rightControl.css('cursor', 'pointer');
      rightControl.css('text-decoration', 'none');
      rightControl.prop('title', nextYearTitle);
      rightControlAnchorParent.prop('class', 'enabled-slide');
      rightControlAnchorBenefitsParent.prop('class', 'enabled-slide-adjusted');
      rightControlAnchorOtherParent.prop('class', 'enabled-slide-adjusted');
      rightControlAnchorTotalParent.prop('class', 'enabled-slide-adjusted-total');
      rightControlAnchor.css('cursor', 'pointer');
      rightControlAnchor.css('text-decoration', 'none');
      rightControlAnchor.prop('title', nextYearTitle);
    }
    else {
      this.set('shownYearsEnd', endYear);
    }
    return (this.get('years').length > maxYearsShown);
  }),

  totalTableColspan: computed('yearsShown', 'years.[]', 'shownYearsEnd', function() {
    const maxYearsShown = this.get('maxYearsShown');
    let span = (this.get('yearsShown').length * 3) + 2; // number of years * number of columns in each year + 1 item description column + 1 total amounts requested column
    if (this.get('years').length > maxYearsShown) {
      span += 2; // if sliders are shown add 2 more columns for slider rows
    }
    return span;
  }),

  slidersShown: computed('years.[]', 'maxYearsShown', function() {
    if (this.get('years').length > this.get('maxYearsShown')) {
      return true;
    }
    return false;
  }),

  getSum(total, item) {
    const adder = (isEmpty(item.get('total'))) ? 0 : item.get('total'); // isEmpty is defined at the end of this file, outside of the Controller definition
    return total + parseInt(adder, 10);
  },

  totalsByYear(items) {
    const yearTotals = [];
    const numYears = this.get('years').length;

    const itemsLength = items.length;
    for (let i = 0; i < numYears; i += 1) {
      let total = 0;
      for (let j = 0; j < itemsLength; j += 1) {
        const item = items[j].get('prices')[i].value;

        let value;

        if (isEmpty(item)) {
          value = 0;
        }
        else if (amountPattern.test(item)) {
          value = item.replace(/,/g, '');
          value = parseInt(value, 10);
        }
        else {
          total = calculationErrorMessage;
          break;
        }

        total += value;
      }
      yearTotals.push(total);
    }
    return yearTotals;
  },
  monthTotalsByYear(items) {
    const yearMonthTotals = [];
    const numYears = this.get('years').length;

    const itemsLength = items.length;
    for (let i = 0; i < numYears; i += 1) {
      let total = 0;
      for (let j = 0; j < itemsLength; j += 1) {
        let months = items[j].get('prices')[i].months;

        if (isEmpty(months)) {
          months = 0;
        }
        else if (monthPattern.test(months)) {
          months = parseFloat(months.toString());
        }
        else {
          total = calculationErrorMessage;
          break;
        }
        total += months;
      }
      if (total == calculationErrorMessage) {
        yearMonthTotals.push(total);
      }
      else {
        yearMonthTotals.push(parseFloat(total).toFixed(2));
      }
    }
    return yearMonthTotals;
  },

  personTotalsByYear(items) {
    const yearPersonTotals = [];
    const numYears = this.get('years').length;

    const itemsLength = items.length;
    for (let i = 0; i < numYears; i += 1) {
      let total = 0;
      for (let j = 0; j < itemsLength; j += 1) {
        let persons = items[j].get('prices')[i].persons;

        if (isEmpty(persons)) {
          persons = 0;
        }
        else if (personnelPattern.test(persons)) {
          persons = persons.replace(/,/g, '');
          persons = parseInt(persons, 10);
        }
        else {
          total = calculationErrorMessage;
          break;
        }
        total += persons;
      }
      yearPersonTotals.push(total);
    }
    return yearPersonTotals;
  },

  ratedTotalsByYear(items) {
    const yearTotals = [];
    const numYears = this.get('years').length;

    const itemsLength = items.length;
    for (let i = 0; i < numYears; i += 1) {
      let total = 0;
      for (let j = 0; j < itemsLength; j += 1) {
        const item = items[j].get('prices')[i];
        let rate = item.rate;
        let base = item.base;

        if ((!isEmpty(rate) && !ratePattern.test(rate)) || (!isEmpty(base) && !amountPattern.test(base))) {
          total = calculationErrorMessage;
          break;
        }

        if (isEmpty(base)) {
          base = 0;
        }
        else if (amountPattern.test(base)) {
          base = base.replace(/,/g, '');
          base = parseInt(base, 10);
        }
        rate = (isEmpty(rate)) ? 0 : parseFloat(rate);
        total += Math.round((rate / 100) * base);
      }
      yearTotals.push(total);
    }
    return yearTotals;
  },

  addYearToLineItem(list) {
    for (let i = 0; i < list.length; i += 1) {
      list[i].addYear();
    }
  },
  copyYearByLineItem(list, yearToCopy) {
    for (let i = 0; i < list.length; i += 1) {
      list[i].copyYear(yearToCopy);
    }
  },
  deleteYearByLineItem(list, yearToCopy) {
    for (let i = 0; i < list.length; i += 1) {
      list[i].deleteYear(yearToCopy);
    }
  },

  // Begin Senior Personnel
  seniorPersonnel: computed(function() {
    return [
      MonthLineItem.create({name: '(PI)', role: 'PI'}),
    ];
  }),
  seniorPersonnelTotalByYear: computed('seniorPersonnel.@each.total', function() {
    const seniorPersonnelVisible = [];
    for (let i = 0; i < this.get('seniorPersonnel').length; i += 1) {
      if (!this.get('seniorPersonnel')[i].hidden) {
        seniorPersonnelVisible.push(this.get('seniorPersonnel')[i]);
      }
    }
    return this.totalsByYear(seniorPersonnelVisible);
  }),
  seniorPersonnelGrandTotal: computed('seniorPersonnel.@each.total', function() {
    const sum = this.get('seniorPersonnel').reduce(this.getSum, 0);
    return isNaN(sum) ? calculationErrorMessage : sum;
  }),
  seniorPersonnelCount: computed('seniorPersonnel.@each.hidden', function() {
    let count = 0;
    for (let i = 0; i < this.get('seniorPersonnel').length; i += 1) {
      if (!this.get('seniorPersonnel')[i].hidden) {
        count += 1;
      }
    }
    return count;
  }),

  seniorPersonnelMonthTotalByYear: computed('seniorPersonnel.@each.monthTotal', 'years.[]', function() {
    const seniorPersonnelVisible = [];
    for (let i = 0; i < this.get('seniorPersonnel').length; i += 1) {
      if (!this.get('seniorPersonnel')[i].hidden) {
        seniorPersonnelVisible.push(this.get('seniorPersonnel')[i]);
      }
    }
    return this.monthTotalsByYear(seniorPersonnelVisible);
  }),
  // End Senior Personnel

  // Begin Other Personnel
  otherPersonnel: computed(function() {
    return [
      NumberedPersonLineItem.create({name: 'Postdoctoral Scholars'}),
      NumberedPersonLineItem.create({name: 'Other Professionals'}),
      NumberedPersonLineItem.create({name: 'Graduate Students'}),
      NumberedPersonLineItem.create({name: 'Undergraduate Students'}),
      NumberedPersonLineItem.create({name: 'Administrative/Clerical'}),
      NumberedPersonLineItem.create({name: 'Other'})
    ];
  }),
  otherPersonnelTotalByYear: computed('otherPersonnel.@each.total', function() {
    return this.totalsByYear(this.get('otherPersonnel'));
  }),
  otherPersonnelGrandTotal: computed('otherPersonnel.@each.total', function() {
    const sum = this.get('otherPersonnel').reduce(this.getSum, 0);
    return isNaN(sum) ? calculationErrorMessage : sum;
  }),
  otherPersonnelPersonnelTotalByYear: computed('otherPersonnel.@each.personTotal', function() {
    return this.personTotalsByYear(this.get('otherPersonnel'));
  }),
  // End Other Personnel

  // Begin Fringe Benefits
  fringeBenefits: computed(function() {
    return LineItem.create();
  }),
  fringeBenefitsTotalByYear: computed('fringeBenefits.total', function() {
    const yearTotals = [];
    const numYears = this.get('years').length;

    const fringeBenefits = this.get('fringeBenefits');
    for (let i = 0; i < numYears; i += 1) {
      let value = fringeBenefits.get('prices')[i].value;

      if (isEmpty(value)) {
        value = 0;
      }
      else if (amountPattern.test(value)) {
        value = value.replace(/,/g, '');
        value = parseInt(value, 10);
      }
      else {
        value = calculationErrorMessage;
      }
      yearTotals.push(value);
    }
    return yearTotals;
  }),
  // End Fringe Benefits

  // Begin Equipment
  equipment: computed(function() {
    return [];
  }),
  equipmentTotalByYear: computed('years.[]', 'equipment.@each.total', function() {
    return this.totalsByYear(this.get('equipment'));
  }),
  equipmentGrandTotal: computed('equipment.@each.total', function() {
    const sum = this.get('equipment').reduce(this.getSum, 0);
    return isNaN(sum) ? calculationErrorMessage : sum;
  }),
  // End Equipment

  // Begin Travel
  travel: computed(function() {
    return [
      LineItem.create({name: 'US, territories, and possessions'}),
      LineItem.create({name: 'Foreign'})
    ];
  }),
  travelTotalByYear: computed('travel.@each.total', function() {
    return this.totalsByYear(this.get('travel'));
  }),
  travelGrandTotal: computed('travel.@each.total', function() {
    const sum = this.get('travel').reduce(this.getSum, 0);
    return isNaN(sum) ? calculationErrorMessage : sum;
  }),
  // End Travel

  pscNumParticipants: computed(function() {
    return NumberedPersonLineItem.create();
  }),


  participantSupportCosts: computed(function() {
    return [
      LineItem.create({name: 'Stipends'}),
      LineItem.create({name: 'Travel'}),
      LineItem.create({name: 'Subsistence'}),
      LineItem.create({name: 'Other'})
    ];
  }),
  participantSupportCostsTotalByYear: computed('participantSupportCosts.@each.total', function() {
    return this.totalsByYear(this.get('participantSupportCosts'));
  }),
  participantSupportCostsGrandTotal: computed('participantSupportCosts.@each.total', function() {
    const sum = this.get('participantSupportCosts').reduce(this.getSum, 0);
    return isNaN(sum) ? calculationErrorMessage : sum;
  }),

  otherDirectCosts: computed('isCollaborativeProposal', function() {
    const isCollaborativeProposal = this.get('isCollaborativeProposal');
    const subawardLineItemName = 'Subawards';
    const otherDirectCostLineItemData = [
      {
        lineItemName: 'Materials and Supplies',
        serializedField: 'materialsDollarAmount'
      }, {
        lineItemName: 'Publication Costs/Documentation/Distrib',
        serializedField: 'publicationDollarAmount'
      }, {
        lineItemName: 'Consultant Services',
        serializedField: 'consultantServicesDollarAmount'
      },
      {
        lineItemName: 'Computer Services',
        serializedField: 'computerServicesDollarAmount'
      },
      {
        lineItemName: subawardLineItemName,
        serializedField: 'subContractDollarAmount'
      }, {
        lineItemName: 'Other',
        serializedField: 'otherDirectCostDollarAmount'
      }];


    const otherDirectCostLineItems = otherDirectCostLineItemData
      .map(lItemData => LineItem.create({name: lItemData.lineItemName, serializedField: lItemData.serializedField}))
      .filter(lineItem => (lineItem.name !== subawardLineItemName) || isCollaborativeProposal);

    return otherDirectCostLineItems;
  }),
  otherDirectCostsTotalByYear: computed('otherDirectCosts.@each.total', function() {
    return this.totalsByYear(this.get('otherDirectCosts'));
  }),
  otherDirectCostsGrandTotal: computed('otherDirectCosts.@each.total', function() {
    const sum = this.get('otherDirectCosts').reduce(this.getSum, 0);
    return isNaN(sum) ? calculationErrorMessage : sum;
  }),


  indirectCosts: computed(function() {
    return [];
  }),
  indirectCostsTotalByYear: computed('years.[]', 'indirectCosts.@each.total', function() {
    return this.ratedTotalsByYear(this.get('indirectCosts'));
  }),
  indirectCostsTotal: computed('indirectCosts.@each.total', function() {
    const sum = this.get('indirectCosts').reduce(this.getSum, 0);
    return isNaN(sum) ? calculationErrorMessage : sum;
  }),

  // section subtotals
  salariesWagesFringeBenefitsTotalByYear: computed('seniorPersonnelTotalByYear', 'otherPersonnelTotalByYear', 'fringeBenefitsTotalByYear', function() {
    const yearTotals = [];
    const numYears = this.get('years').length;

    const seniorPersonnelTotalByYear = this.get('seniorPersonnelTotalByYear');
    const otherPersonnelTotalByYear = this.get('otherPersonnelTotalByYear');
    const fringeBenefitsTotalByYear = this.get('fringeBenefitsTotalByYear');

    for (let i = 0; i < numYears; i += 1) {
      let sum = seniorPersonnelTotalByYear[i] + otherPersonnelTotalByYear[i] + fringeBenefitsTotalByYear[i];
      sum = isNaN(sum) ? calculationErrorMessage : sum;
      yearTotals.push(sum);
    }
    return yearTotals;
  }),

  salariesWagesFringeBenefitsGrandTotal: computed('seniorPersonnelGrandTotal', 'otherPersonnelGrandTotal', 'fringeBenefits.total', function() {
    const sum = this.get('seniorPersonnelGrandTotal') + this.get('otherPersonnelGrandTotal') + this.get('fringeBenefits.total');
    return isNaN(sum) ? calculationErrorMessage : sum;
  }),

  directCostsTotalByYear: computed('salariesWagesFringeBenefitsTotalByYear', 'equipmentTotalByYear', 'travelTotalByYear', 'participantSupportCostsTotalByYear', 'otherDirectCostsTotalByYear', function() {
    const yearTotals = [];
    const numYears = this.get('years').length;

    const salariesWagesFringeBenefitsTotalByYear = this.get('salariesWagesFringeBenefitsTotalByYear');
    const equipmentTotalByYear = this.get('equipmentTotalByYear');
    const travelTotalByYear = this.get('travelTotalByYear');
    const participantSupportCostsTotalByYear = this.get('participantSupportCostsTotalByYear');
    const otherDirectCostsTotalByYear = this.get('otherDirectCostsTotalByYear');

    for (let i = 0; i < numYears; i += 1) {
      let sum = salariesWagesFringeBenefitsTotalByYear[i] + equipmentTotalByYear[i] +
        travelTotalByYear[i] + participantSupportCostsTotalByYear[i] + otherDirectCostsTotalByYear[i];
      sum = isNaN(sum) ? calculationErrorMessage : sum;
      yearTotals.push(sum);
    }
    return yearTotals;
  }),

  directCostsGrandTotal: computed('salariesWagesFringeBenefitsGrandTotal', 'equipmentGrandTotal', 'travelGrandTotal', 'participantSupportCostsGrandTotal', 'otherDirectCostsGrandTotal', function() {
    const sum = this.get('salariesWagesFringeBenefitsGrandTotal') + this.get('equipmentGrandTotal') +
      this.get('travelGrandTotal') + this.get('participantSupportCostsGrandTotal') +
      this.get('otherDirectCostsGrandTotal');
    return isNaN(sum) ? calculationErrorMessage : sum;
  }),

  totalAmountRequestedTotalByYear: computed('directCostsTotalByYear', 'indirectCostsTotalByYear', function() {
    const yearTotals = [];
    const numYears = this.get('years').length;

    const directCostsTotalByYear = this.get('directCostsTotalByYear');
    const indirectCostsTotalByYear = this.get('indirectCostsTotalByYear');

    for (let i = 0; i < numYears; i += 1) {
      let sum = directCostsTotalByYear[i] + indirectCostsTotalByYear[i];
      sum = isNaN(sum) ? calculationErrorMessage : sum;
      yearTotals.push(sum);
    }
    return yearTotals;
  }),
  totalAmountRequestedGrandTotal: computed('directCostsGrandTotal', 'indirectCostsTotal', function() {
    const sum = this.get('directCostsGrandTotal') + this.get('indirectCostsTotal');
    return (isNaN(sum) ? calculationErrorMessage : sum);
  }),

  /**
   * reInit - GET a new budget every time the page is loaded
   */
  reInit() {
    this.set('isFormSubmission', true);
    this.set('budgetImpactAlertMsgDisplayAdded', false);
    this.send('getBudget');
  },

  /**
   * initBudgetYears - add/remove years to prepare to fill in budget data
   */
  initBudgetYears() {
    if (this.get('budget') && this.get('budget').state == 'fulfilled') {
      if (this.get('years').length < this.get('budget').value.institutionBudget.budgetRecordList.length) {
        while (this.get('years').length < this.get('budget').value.institutionBudget.budgetRecordList.length) {
          this.set('addType', 'blank');
          this.send('addYear');
        }
      }
      else if (this.get('years').length > this.get('budget').value.institutionBudget.budgetRecordList.length && this.get('years').length > 1) {
        while (this.get('years').length > this.get('budget').value.institutionBudget.budgetRecordList.length && this.get('years').length > 1) {
          this.set('selectedDeleteYear', this.get('years')[0]);
          this.send('deleteYear');
        }
      }
      this.initBudgetData(this.get('budget').value.institutionBudget.budgetRecordList);
    }
    else {
      this.initBudgetData([]);
    }
  },

  initBudgetData(budgetData) {
    if (!budgetData || budgetData.length == 0) {
      // @TODO I don't think this is a valid use case anymore
      // If there is no budgetData at all this is an error and should be caught earlier
      // If no budgetData exists, initialize
      this.set('seniorPersonnel', [MonthLineItem.create({name: '(PI)', role: 'PI'})]);
      // reset other sections here if needed
      this.set('otherPersonnel', [
        NumberedPersonLineItem.create({name: 'Postdoctoral Scholars'}),
        NumberedPersonLineItem.create({name: 'Other Professionals'}),
        NumberedPersonLineItem.create({name: 'Graduate Students'}),
        NumberedPersonLineItem.create({name: 'Undergraduate Students'}),
        NumberedPersonLineItem.create({name: 'Administrative/Clerical'}),
        NumberedPersonLineItem.create({name: 'Other'})
      ]
      );
      this.set('fringeBenefits', LineItem.create());
      this.set('equipment', []);
      this.set('travel', [LineItem.create({name: 'US, territories, and possessions'}), LineItem.create({name: 'Foreign'})]);
      this.set('participantSupportCosts', [
        LineItem.create({name: 'Stipends'}),
        LineItem.create({name: 'Travel'}),
        LineItem.create({name: 'Subsistence'}),
        LineItem.create({name: 'Other'})
      ]
      );
      this.set('pscNumParticipants', NumberedPersonLineItem.create());
      this.set('otherDirectCosts', this.get('otherDirectCosts'));
      this.set('indirectCosts', []);


      return;
    }

    /* Initialize Senior Personnel */
    if (budgetData && budgetData[0] && budgetData[0].srPersonnelList) {
      const srPersonList = budgetData[0].srPersonnelList;
      const namesToPush = [];
      for (let i = 0; i < srPersonList.length; i += 1) {
        const displayRole = this.lookup('seniorPersonRoleTypes', srPersonList[i].seniorPersonRoleCode, 'code', 'abbreviation');

        let displayName = srPersonList[i].seniorPersonFirstName;
        if (srPersonList[i].seniorPersonMiddleInitial) {
          displayName += ` ${srPersonList[i].seniorPersonMiddleInitial}`;
        }
        displayName += ` ${srPersonList[i].seniorPersonLastName} (${displayRole})`;

        const pricesValue = [];
        for (let j = 0; j < budgetData.length; j += 1) {
          const monthsValue = (budgetData[j].srPersonnelList[i].seniorPersonMonthCount == 0) ? '0.00' : budgetData[j].srPersonnelList[i].seniorPersonMonthCount;
          const fundsValue = addCommasForNumber(budgetData[j].srPersonnelList[i].seniorPersonDollarAmount);
          pricesValue.push({months: monthsValue, value: fundsValue, monthError: null, valueError: null});
        }

        const mLineItem = MonthLineItem.create({
          name: displayName,
          role: displayRole,
          prices: pricesValue,
          seniorPersonInstId: this.get('institutionId'),
          hidden: srPersonList[i].hidden,
          shadowHidden: srPersonList[i].hidden, // use for temp update in Manage Personnel modal
          seniorPersonNsfId: srPersonList[i].seniorPersonNsfId,
          seniorPersonRoleCode: srPersonList[i].seniorPersonRoleCode,
          seniorPersonFirstName: srPersonList[i].seniorPersonFirstName,
          seniorPersonLastName: srPersonList[i].seniorPersonLastName,
          propPersId: srPersonList[i].propPersId
        });

        namesToPush.push(mLineItem);
      }

      this.set('seniorPersonnel', namesToPush);
    }

    /* Initialize Other Personnel*/
    const initOtherPersonArray = {
      'Postdoctoral Scholars': [],
      'Other Professionals': [],
      'Graduate Students': [],
      'Undergraduate Students': [],
      'Administrative/Clerical': [],
      'Other': []
    };
    for (let j = 0; j < budgetData.length; j += 1) {
      if (budgetData[j] && budgetData[j].otherPersonnelList) {
        const otherPersonList = budgetData[j].otherPersonnelList;
        for (let i = 0; i < otherPersonList.length; i += 1) {
          // @TODO can remove this check when otherPersonRoleTypes api is updated/fixed
          if (otherPersonList[i].otherPersonTypeCode && this.lookup('otherPersonRoleTypes', otherPersonList[i].otherPersonTypeCode.trim(), 'code', 'description')) {
            initOtherPersonArray[this.lookup('otherPersonRoleTypes', otherPersonList[i].otherPersonTypeCode.trim(), 'code', 'description')].push({
              value: addCommasForNumber(otherPersonList[i].otherPersonDollarAmount),
              months: (otherPersonList[i].otherPersonMonthCount == 0) ? '0.00' : addCommasForNumber(otherPersonList[i].otherPersonMonthCount),
              count: addCommasForNumber(otherPersonList[i].otherPersonCount.toString()),
              otherPersonTypeCode: otherPersonList[i].otherPersonTypeCode.trim()
            });
          }
        }
      }
    }

    const otherPersonnel = this.get('otherPersonnel');
    const initOtherPersonKeys = Object.keys(initOtherPersonArray);
    let otherPersonnelFound = false;
    initOtherPersonKeys.forEach(function(key) {
      const obj = initOtherPersonArray[key];
      if (obj.length) {
        otherPersonnelFound = true;
        for (let j = 0; j < otherPersonnel.length; j += 1) {
          if (otherPersonnel[j].name == key) {
            otherPersonnel[j].initializePrices(obj);
          }
        }
      }
    });
    if (!otherPersonnelFound) {
      this.set('otherPersonnel', [NumberedPersonLineItem.create({name: 'Postdoctoral Scholars'}),
        NumberedPersonLineItem.create({name: 'Other Professionals'}),
        NumberedPersonLineItem.create({name: 'Graduate Students'}),
        NumberedPersonLineItem.create({name: 'Undergraduate Students'}),
        NumberedPersonLineItem.create({name: 'Administrative/Clerical'}),
        NumberedPersonLineItem.create({name: 'Other'})]);
    }

    /* Initialize Fringe Benefits */
    const fringeBenefits = this.get('fringeBenefits');
    const fringeBenefitsPricesValue = [];
    for (let i = 0; i < budgetData.length; i += 1) {
      if (budgetData[i] && budgetData[i].fringeBenefitCost) {
        if (budgetData[i].fringeBenefitCost.fringeBenefitDollarAmount == null || budgetData[i].fringeBenefitCost.fringeBenefitDollarAmount == undefined) {
          fringeBenefitsPricesValue.push({value: 0});
        }
        else {
          fringeBenefitsPricesValue.push({value: addCommasForNumber(budgetData[i].fringeBenefitCost.fringeBenefitDollarAmount)});
        }
      }
      else if (budgetData[i]) {
        fringeBenefitsPricesValue.push({value: 0});
      }
    }
    if (fringeBenefitsPricesValue.length) {
      fringeBenefits.initializePrices(fringeBenefitsPricesValue);
    }

    /* Initialize Equipment */
    const equipmentListToPush = [];
    const equipmentPricesValue = [];
    for (let i = 0; i < budgetData.length; i += 1) {
      if (budgetData[i] && budgetData[i].equipmentList && budgetData[i].equipmentList.length) {
        const equipmentList = budgetData[i].equipmentList;

        // initialze equipment line items
        if (i == 0) {
          for (let j = 0; j < equipmentList.length; j += 1) {
            const equipmentLineItem = LineItem.create({
              name: equipmentList[j].equipmentName
            });
            equipmentListToPush.push(equipmentLineItem);
            equipmentPricesValue.push([]);
          }
        }

        // initialize equipment prices
        for (let j = 0; j < equipmentList.length; j += 1) {
          if (equipmentList[j] && equipmentList[j].equipmentDollarAmount) {
            equipmentPricesValue[j].push({value: addCommasForNumber(equipmentList[j].equipmentDollarAmount)});
          }
          else {
            equipmentPricesValue[j].push({value: 0});
          }
        }
      }
    }
    for (let i = 0; i < equipmentListToPush.length; i += 1) {
      equipmentListToPush[i].initializePrices(equipmentPricesValue[i]);
    }
    this.set('equipment', equipmentListToPush);

    /* Initialize Travel data */
    const travelInfo = [
      LineItem.create({name: 'US, territories, and possessions'}),
      LineItem.create({name: 'Foreign'})
    ];
    const travelPrices = [[], []];

    for (let i = 0; i < budgetData.length; i += 1) {
      if (budgetData[i] && budgetData[i].travelCost && budgetData[i].travelCost.domesticTravelDollarAmount) {
        travelPrices[0].push({value: addCommasForNumber(budgetData[i].travelCost.domesticTravelDollarAmount.toString())});
      }
      else {
        travelPrices[0].push({value: 0});
      }
      if (budgetData[i] && budgetData[i].travelCost && budgetData[i].travelCost.foreignTravelDollarAmount) {
        travelPrices[1].push({value: addCommasForNumber(budgetData[i].travelCost.foreignTravelDollarAmount.toString())});
      }
      else {
        travelPrices[1].push({value: 0});
      }
    }
    for (let i = 0; i < travelPrices.length; i += 1) {
      travelInfo[i].initializePrices(travelPrices[i]);
    }
    this.set('travel', travelInfo);


    /* Initialize Participant Support Costs data */
    const participantInfo = [
      LineItem.create({name: 'Stipends'}),
      LineItem.create({name: 'Travel'}),
      LineItem.create({name: 'Subsistence'}),
      LineItem.create({name: 'Other'})
    ];
    const participantPrices = [[], [], [], []];
    const pscNumParticipants = NumberedPersonLineItem.create();
    const pscPrices = [];
    for (let i = 0; i < budgetData.length; i += 1) {
      if (budgetData[i] && budgetData[i].participantsSupportCost && budgetData[i].participantsSupportCost.partNumberCount) {
        pscPrices.push({count: addCommasForNumber(budgetData[i].participantsSupportCost.partNumberCount.toString())});
      }
      else { pscPrices.push({count: 0}); }
      if (budgetData[i] && budgetData[i].participantsSupportCost && budgetData[i].participantsSupportCost.stipendDollarAmount) {
        participantPrices[0].push({value: addCommasForNumber(budgetData[i].participantsSupportCost.stipendDollarAmount.toString())});
      }
      else { participantPrices[0].push({value: 0}); }
      if (budgetData[i] && budgetData[i].participantsSupportCost && budgetData[i].participantsSupportCost.travelDollarAmount) {
        participantPrices[1].push({value: addCommasForNumber(budgetData[i].participantsSupportCost.travelDollarAmount.toString())});
      }
      else { participantPrices[1].push({value: 0}); }
      if (budgetData[i] && budgetData[i].participantsSupportCost && budgetData[i].participantsSupportCost.subsistenceDollarAmount) {
        participantPrices[2].push({value: addCommasForNumber(budgetData[i].participantsSupportCost.subsistenceDollarAmount.toString())});
      }
      else { participantPrices[2].push({value: 0}); }
      if (budgetData[i] && budgetData[i].participantsSupportCost && budgetData[i].participantsSupportCost.otherDollarAmount) {
        participantPrices[3].push({value: addCommasForNumber(budgetData[i].participantsSupportCost.otherDollarAmount.toString())});
      }
      else { participantPrices[3].push({value: 0}); }
    }
    for (let i = 0; i < participantPrices.length; i += 1) {
      if (participantPrices[i].length) {
        participantInfo[i].initializePrices(participantPrices[i]);
      }
    }
    if (pscPrices.length) {
      pscNumParticipants.initializePrices(pscPrices);
    }
    this.set('participantSupportCosts', participantInfo);
    this.set('pscNumParticipants', pscNumParticipants);

    /* Initialize Other Direct Costs */
    const otherDirectCostInfo = this.get('otherDirectCosts');

    const otherDirectCostPrices = []; // [[], [], [], [], [], []];

    for (let i = 0; i < budgetData.length; i += 1) {
      otherDirectCostInfo.forEach((otherDirectCostLineItem, idx) => {
        const serializedFieldKey = otherDirectCostLineItem.serializedField;
        otherDirectCostPrices.push([]);
        if (budgetData[i] && budgetData[i].otherDirectCost && budgetData[i].otherDirectCost[serializedFieldKey]) {
          otherDirectCostPrices[idx].push({value: addCommasForNumber(budgetData[i].otherDirectCost[serializedFieldKey].toString())});
        }
        else { otherDirectCostPrices[idx].push({value: 0}); }
      });
    }

    for (let i = 0; i < otherDirectCostPrices.length; i += 1) {
      if (otherDirectCostPrices[i].length) {
        otherDirectCostInfo[i].initializePrices(otherDirectCostPrices[i]);
      }
    }
    this.set('otherDirectCosts', otherDirectCostInfo);

    /* Initialize Indirect Costs */
    const indirectCostsListToPush = [];
    const indirectCostsPricesValue = [];
    for (let i = 0; i < budgetData.length; i += 1) {
      if (budgetData[i] && budgetData[i].indirectCostsList && budgetData[i].indirectCostsList.length) {
        const indirectCostsList = budgetData[i].indirectCostsList;

        // initialze indirect cost line items
        if (i == 0) {
          for (let j = 0; j < indirectCostsList.length; j += 1) {
            const indirectCostsLineItem = RatedLineItem.create({
              name: indirectCostsList[j].indirectCostItemName
            });
            indirectCostsListToPush.push(indirectCostsLineItem);
            indirectCostsPricesValue.push([]);
          }
        }

        // initialize indirect cost prices
        for (let j = 0; j < indirectCostsList.length; j += 1) {
          if (indirectCostsList[j] && indirectCostsList[j].indirectCostBaseDollarAmount) {
            indirectCostsPricesValue[j].push({
              base: addCommasForNumber(indirectCostsList[j].indirectCostBaseDollarAmount),
              rate: indirectCostsList[j].indirectCostRate
            });
          }
          else if (indirectCostsList[j] && indirectCostsList[j].indirectCostRate) {
            indirectCostsPricesValue[j].push({
              base: 0,
              rate: indirectCostsList[j].indirectCostRate
            })
          }
          else {
            indirectCostsPricesValue[j].push({base: 0, rate: 0});
          }
        }
      }
    }
    for (let i = 0; i < indirectCostsListToPush.length; i += 1) {
      indirectCostsListToPush[i].initializePrices(indirectCostsPricesValue[i]);
    }
    this.set('indirectCosts', indirectCostsListToPush);

    this.checkPostDocAlert();
  },

  gatherBudgetData() {
    if (!this.get('budget') || !this.get('budget').value || !this.get('budget').value.institutionBudget || !this.get('budget').value.institutionBudget.propInstRecId) {
      const message = {status: 'error', dismissable: false, message: this.get('messageTexts.fail_generic')};
      this.get('messageService').addMessage(message);
    }

    const budgetJSON = {
      'propPrepId': this.get('propPrepId'),
      'propRevId': this.get('propRevId'),
      'propInstRecId': this.get('budget').value.institutionBudget.propInstRecId,
      'instId': this.get('institutionId'),
      'instPropRoleTypeCode': this.get('budget').value.institutionBudget.instPropRoleTypeCode,
      'budgetRecordList': [

      ]
    };

    const years = this.get('years');

    for (let i = 0; i < years.length; i += 1) {
      const budgetJSONbyYear = {
        'budgetYear': (i + 1)
      };

      /* Gather Senior Personnel data */
      budgetJSONbyYear.srPersonnelList = [];
      const seniorPersonnel = this.get('seniorPersonnel');

      for (let j = 0; j < seniorPersonnel.length; j += 1) {
        const personObjectData = {
          'seniorPersonRoleCode': seniorPersonnel[j].seniorPersonRoleCode,
          'seniorPersonNsfId': seniorPersonnel[j].seniorPersonNsfId,
          'seniorPersonInstId': this.get('institutionId'),
          'seniorPersonFirstName': seniorPersonnel[j].seniorPersonFirstName,
          'seniorPersonLastName': seniorPersonnel[j].seniorPersonLastName,
          'hidden': seniorPersonnel[j].hidden,
          'propPersId': seniorPersonnel[j].propPersId
        };
        if (seniorPersonnel[j].seniorPersonMiddleInitial) { personObjectData.seniorPersonMiddleInitial = seniorPersonnel[j].seniorPersonMiddleInitial; }
        const prices = seniorPersonnel[j].get('prices');
        if (prices && prices[i] && prices[i].months) { personObjectData.seniorPersonMonthCount = prices[i].months; }
        if (prices && prices[i] && prices[i].value) { personObjectData.seniorPersonDollarAmount = parseInt(removeCommasForNumber(prices[i].value), 10); }

        if (!prices || !prices[i] || prices[i].months == '' || prices[i].months == null) { personObjectData.seniorPersonMonthCount = 0; }
        if (!prices || !prices[i] || prices[i].value == '' || prices[i].value == null) { personObjectData.seniorPersonDollarAmount = 0; }
        budgetJSONbyYear.srPersonnelList.push(personObjectData);
      }

      /* Gather Other Personnel data */
      budgetJSONbyYear.otherPersonnelList = [];
      const otherPersonnel = this.get('otherPersonnel');
      for (let j = 0; j < otherPersonnel.length; j += 1) {
        const prices = otherPersonnel[j].get('prices');
        if (prices && prices[i]) {
          const otherPersonObjectData = {
            'otherPersonTypeCode': this.lookup('otherPersonRoleTypes', otherPersonnel[j].name, 'description', 'code'),
            'otherPersonCount': parseInt(removeCommasForNumber(prices[i].persons), 10),
            'otherPersonMonthCount': parseFloat(removeCommasForNumber(prices[i].months)),
            'otherPersonDollarAmount': parseInt(removeCommasForNumber(prices[i].value), 10)
          };
          if (prices[i].persons == '' || prices[i].persons == null) { otherPersonObjectData.otherPersonCount = 0; }
          if (prices[i].months == '' || prices[i].months == null) { otherPersonObjectData.otherPersonMonthCount = 0; }
          if (prices[i].value == '' || prices[i].value == null) { otherPersonObjectData.otherPersonDollarAmount = 0; }
          budgetJSONbyYear.otherPersonnelList.push(otherPersonObjectData);
        }
        else {
          const otherPersonObjectData = {
            'otherPersonTypeCode': this.lookup('otherPersonRoleTypes', otherPersonnel[j].name, 'description', 'code'),
            'otherPersonCount': 0,
            'otherPersonMonthCount': 0,
            'otherPersonDollarAmount': 0
          };
          budgetJSONbyYear.otherPersonnelList.push(otherPersonObjectData);
        }
      }

      /* Gather Fringe Benefits data */
      if (this.get('fringeBenefitsTotalByYear')[i]) {
        budgetJSONbyYear.fringeBenefitCost = {
          'fringeBenefitDollarAmount': this.get('fringeBenefitsTotalByYear')[i]
        };
      }
      else {
        budgetJSONbyYear.fringeBenefitCost = {
          'fringeBenefitDollarAmount': 0
        };
      }

      /* Gather Equipment data */
      budgetJSONbyYear.equipmentList = [];
      const equipmentList = this.get('equipment');
      for (let j = 0; j < equipmentList.length; j += 1) {
        const prices = equipmentList[j].get('prices');
        if (prices && prices[i]) {
          const equipmentObjectData = {
            'equipmentName': (equipmentList[j].name == null) ? '' : equipmentList[j].name.trim(),
            'equipmentDollarAmount': parseInt(removeCommasForNumber(prices[i].value), 10)
          };
          if (prices[i].value == '' || prices[i].value == null) { equipmentObjectData.equipmentDollarAmount = 0; }
          budgetJSONbyYear.equipmentList.push(equipmentObjectData);
        }
        else {
          const equipmentObjectData = {
            'equipmentName': equipmentList[j].name.trim(),
            'equipmentDollarAmount': 0
          };
          budgetJSONbyYear.equipmentList.push(equipmentObjectData);
        }
      }

      /* Gather Travel data */
      const travelInfo = this.get('travel');
      const travelInfoToSend = {};
      if (travelInfo[0].get('prices')[i].value) {
        travelInfoToSend.domesticTravelDollarAmount = parseInt(removeCommasForNumber(travelInfo[0].get('prices')[i].value), 10);
      }
      if (travelInfo[1].get('prices')[i].value) {
        travelInfoToSend.foreignTravelDollarAmount = parseInt(removeCommasForNumber(travelInfo[1].get('prices')[i].value), 10);
      }
      if (travelInfoToSend != {}) {
        budgetJSONbyYear.travelCost = travelInfoToSend;
      }

      /* Gather Participant Support Cost data */
      const participantSupportCosts = this.get('participantSupportCosts');
      const numParticipants = this.get('pscNumParticipants');
      const participantInfoToSend = {};
      if (numParticipants.get('prices')[i].persons) { participantInfoToSend.partNumberCount = parseInt(removeCommasForNumber(numParticipants.get('prices')[i].persons), 10); }
      else { participantInfoToSend.partNumberCount = '0'; }
      if (participantSupportCosts[0].get('prices')[i].value) { participantInfoToSend.stipendDollarAmount = parseInt(removeCommasForNumber(participantSupportCosts[0].get('prices')[i].value), 10); }
      else { participantInfoToSend.stipendDollarAmount = '0'; }
      if (participantSupportCosts[1].get('prices')[i].value) { participantInfoToSend.travelDollarAmount = parseInt(removeCommasForNumber(participantSupportCosts[1].get('prices')[i].value), 10); }
      else { participantInfoToSend.travelDollarAmount = '0'; }
      if (participantSupportCosts[2].get('prices')[i].value) { participantInfoToSend.subsistenceDollarAmount = parseInt(removeCommasForNumber(participantSupportCosts[2].get('prices')[i].value), 10); }
      else { participantInfoToSend.subsistenceDollarAmount = '0'; }
      if (participantSupportCosts[3].get('prices')[i].value) { participantInfoToSend.otherDollarAmount = parseInt(removeCommasForNumber(participantSupportCosts[3].get('prices')[i].value), 10); }
      else { participantInfoToSend.otherDollarAmount = '0'; }
      if (participantInfoToSend != {}) {
        budgetJSONbyYear.participantsSupportCost = participantInfoToSend;
      }

      /* Gather Other Direct Costs data */
      const otherDirectCosts = this.get('otherDirectCosts');

      const otherDirectCostsInfoToSend = otherDirectCosts.reduce((accum, otherDirectCost) => {
        const value = otherDirectCost.get('prices')[i].value;

        if (value) {
          accum[otherDirectCost.serializedField] = parseInt(removeCommasForNumber(value), 10)
        }

        return accum;
      }, {});


      if (otherDirectCostsInfoToSend != {}) {
        budgetJSONbyYear.otherDirectCost = otherDirectCostsInfoToSend;
      }

      /* Gather Indirect Cost data */
      budgetJSONbyYear.indirectCostsList = [];
      const indirectCostsList = this.get('indirectCosts');
      for (let j = 0; j < indirectCostsList.length; j += 1) {
        const prices = indirectCostsList[j].get('prices');
        if (prices && prices[i]) {
          const indirectCostsObjectData = {
            'indirectCostItemName': (indirectCostsList[j].name == null) ? '' : indirectCostsList[j].name.trim(),
            'indirectCostBaseDollarAmount': parseInt(removeCommasForNumber(prices[i].base), 10),
            'indirectCostRate': parseFloat(prices[i].rate)
          };
          if (prices[i].base == '' || prices[i].base == null) { indirectCostsObjectData.indirectCostBaseDollarAmount = 0; }
          if (prices[i].rate == '' || prices[i].rate == null) { indirectCostsObjectData.indirectCostRate = 0; }
          budgetJSONbyYear.indirectCostsList.push(indirectCostsObjectData);
        }
        else {
          const indirectCostsObjectData = {
            'indirectCostItemName': indirectCostsList[j].name.trim(),
            'indirectCostBaseDollarAmount': 0,
            'indirectCostRate': 0
          };
          budgetJSONbyYear.indirectCostsList.push(indirectCostsObjectData);
        }
      }

      /* Push all data for this year */
      budgetJSON.budgetRecordList.push(budgetJSONbyYear);
    }

    return budgetJSON;
  },

  getLiveValidationYears() {
    let errorList = [];
    for (let i = 0; i < this.get('seniorPersonnel').length; i += 1) {
      errorList = $.merge($.merge([], errorList), this.get('seniorPersonnel')[i].getErrorList());
    }
    for (let i = 0; i < this.get('otherPersonnel').length; i += 1) {
      errorList = $.merge($.merge([], errorList), this.get('otherPersonnel')[i].getErrorList());
    }
    errorList = $.merge($.merge([], errorList), this.get('fringeBenefits').getErrorList());
    for (let i = 0; i < this.get('equipment').length; i += 1) {
      errorList = $.merge($.merge([], errorList), this.get('equipment')[i].getErrorList('equipment'));
    }
    for (let i = 0; i < this.get('travel').length; i += 1) {
      errorList = $.merge($.merge([], errorList), this.get('travel')[i].getErrorList());
    }
    errorList = $.merge($.merge([], errorList), this.get('pscNumParticipants').getErrorList());
    for (let i = 0; i < this.get('participantSupportCosts').length; i += 1) {
      errorList = $.merge($.merge([], errorList), this.get('participantSupportCosts')[i].getErrorList());
    }
    for (let i = 0; i < this.get('otherDirectCosts').length; i += 1) {
      errorList = $.merge($.merge([], errorList), this.get('otherDirectCosts')[i].getErrorList());
    }
    for (let i = 0; i < this.get('indirectCosts').length; i += 1) {
      errorList = $.merge($.merge([], errorList), this.get('indirectCosts')[i].getErrorList());
    }

    if (errorList.length) {
      const yearsForMessage = [];
      for (let i = 0; i < errorList.length; i += 1) {
        if (!yearsForMessage.includes(errorList[i].errorYear)) {
          yearsForMessage.push(errorList[i].errorYear);
        }
      }
      if (yearsForMessage.length) {
        return yearsForMessage;
      }
    }
    return '';
  },

  /**
   * gatherLiveValidationErrors will collect all live validation errors and report an on screen message
   * Budget Save will be prevented by returning true from this method
   * @returns {boolean}
   * @param otherErrorsExist - Boolean, used to choose which error message format to use
   */
  gatherLiveValidationErrors(displayErrors, otherErrorsExist) {
    // iterate through all objects displayed in form and look at prices object of each to see
    // if there is a monthError or priceError or etc.
    let errorList = [];
    for (let i = 0; i < this.get('seniorPersonnel').length; i += 1) {
      errorList = $.merge($.merge([], errorList), this.get('seniorPersonnel')[i].getErrorList());
    }
    for (let i = 0; i < this.get('otherPersonnel').length; i += 1) {
      errorList = $.merge($.merge([], errorList), this.get('otherPersonnel')[i].getErrorList());
    }
    errorList = $.merge($.merge([], errorList), this.get('fringeBenefits').getErrorList());
    for (let i = 0; i < this.get('equipment').length; i += 1) {
      errorList = $.merge($.merge([], errorList), this.get('equipment')[i].getErrorList('equipment'));
    }
    for (let i = 0; i < this.get('travel').length; i += 1) {
      errorList = $.merge($.merge([], errorList), this.get('travel')[i].getErrorList());
    }
    errorList = $.merge($.merge([], errorList), this.get('pscNumParticipants').getErrorList());
    for (let i = 0; i < this.get('participantSupportCosts').length; i += 1) {
      errorList = $.merge($.merge([], errorList), this.get('participantSupportCosts')[i].getErrorList());
    }
    for (let i = 0; i < this.get('otherDirectCosts').length; i += 1) {
      errorList = $.merge($.merge([], errorList), this.get('otherDirectCosts')[i].getErrorList());
    }
    for (let i = 0; i < this.get('indirectCosts').length; i += 1) {
      errorList = $.merge($.merge([], errorList), this.get('indirectCosts')[i].getErrorList());
    }

    if (errorList.length) {
      const yearsForMessage = [];
      for (let i = 0; i < errorList.length; i += 1) {
        if (!yearsForMessage.includes(errorList[i].errorYear)) {
          yearsForMessage.push(errorList[i].errorYear);
        }
      }
      // If displayErrors is false, return in here:
      if (!displayErrors) {
        return {
          'errorList': errorList,
          'yearsForMessage': yearsForMessage
        };
      }

      if (otherErrorsExist) {
        if (yearsForMessage.length > 1) {
          const message = {status: 'error', dismissable: false, displayType: 'noBullet', message: (`${this.get('messageTexts.fail_live_validations_additional')} (Years ${yearsForMessage.join(', ')})`)};
          this.get('messageService').addMessage(message);
          return true;
        }
        else if (yearsForMessage.length === 1) {
          const message = {status: 'error', dismissable: false, displayType: 'noBullet', message: (`${this.get('messageTexts.fail_live_validations_additional')} (Year ${yearsForMessage.toString()})`)};
          this.get('messageService').addMessage(message);
          return true;
        }
      }

      if (errorList.length === 1) {
        const message = {status: 'error', dismissable: false, displayType: 'noBullet', message: (`${this.get('messageTexts.fail_live_validations_generic')} (Year ${yearsForMessage.toString()})`)};
        this.get('messageService').addMessage(message);
        return true;
      }
      else if (yearsForMessage.length > 1) {
        const message = {status: 'error', dismissable: false, displayType: 'noBullet', message: (`${this.get('messageTexts.fail_live_validations_generic')} (Years ${yearsForMessage.join(', ')})`)};
        this.get('messageService').addMessage(message);
        return true;
      }
      else if (yearsForMessage.length === 1) {
        const message = {status: 'error', dismissable: false, displayType: 'noBullet', message: (`${this.get('messageTexts.fail_live_validations_generic')} (Year ${yearsForMessage.join(', ')})`)};
        this.get('messageService').addMessage(message);
        return true;
      }
    }
    else {
      // If displayErrors is false, return in here:
      if (!displayErrors) {
        return {
          'errorList': errorList,
          'yearsForMessage': []
        };
      }

      const message = {status: 'error', dismissable: false, displayType: 'noBullet', message: this.get('messageTexts.fail_live_validations_generic')};
      this.get('messageService').addMessage(message);
      return true;
    }
    return false;
  },

  lookup(lookupType, lookupMatch, lookupKey, lookupValue) {
    if (lookupType == 'seniorPersonRoleTypes') {
      const lookupObj = this.get('lookupSrPerson').value.seniorPersonRoleTypeLookUps;
      for (let i = 0; i < lookupObj.length; i += 1) {
        if (lookupObj[i][lookupKey] == lookupMatch) {
          return lookupObj[i][lookupValue];
        }
      }
    }
    else if (lookupType == 'otherPersonRoleTypes') {
      const lookupObj = this.get('lookupOtherPerson').value.otherPersonnelRoleTypeLookUps;
      for (let i = 0; i < lookupObj.length; i += 1) {
        if (lookupObj[i][lookupKey] == lookupMatch) {
          return lookupObj[i][lookupValue];
        }
      }
    }
    return '';
  },

  displayNavigationConfirm(transitionTarget) {
    this.set('exitBudgetTransition', transitionTarget);
    const modal = $("div .modal[id*='-unsavedExitConfirmationModal']")[0];
    $(modal).modal();
  },

  /**
   * Show PostDoc Info message if:
   *   1. PostDoc file does not exist
   *   AND
   *   2. Other Personnel PostDoc budget data exists
   */
  checkPostDocAlert() {
    this.get('sectionLookup').loadForProposal(this.get('propPrepId'), this.get('propRevId'));

    if (['12', '13', '14', '15', '16'].indexOf(this.get('model').proposalStatus) === -1) { // Do not show this message if a budget revision has been assigned reviewers
      if (!this.get('hasPostDocPlan').value || !this.get('hasPostDocPlan').value.postDocPlan || !this.get('hasPostDocPlan').value.postDocPlan.filePath) {
        // here check if Other Personnel -> Postdoctoral Scholars has any value
        if (this.hasPostDocBudgetValue()) {
          const message = {status: 'info', dismissable: false, message: this.get('messageTexts.info_postdoc')};
          const self = this;
          setTimeout(function() {
            self.get('messageService').addMessage(message);
          }, 200);
          return;
        }
      }
      // If we get here assume no postdoc alert necessary and make sure we clear it
      this.send('clearInfoMessages');
    }
  },
  hasPostDocBudgetValue() {
    // here check if Other Personnel -> Postdoctoral Scholars has any value
    const otherPersonnel = this.get('otherPersonnel');
    for (let i = 0; i < otherPersonnel.length; i += 1) {
      if (otherPersonnel[i].name == 'Postdoctoral Scholars') {
        const postDocPrices = otherPersonnel[i].get('prices');
        for (let j = 0; j < postDocPrices.length; j += 1) {
          if (postDocPrices[j].value != '0') {
            return true;
          }
        }
      }
    }
    return false;
  },

  actions: {
    personnelShownChange() {
      if ($('#managePersonnelShownList :selected').length) {
        $('#managePersonnelDoubleRight').attr('disabled', false);
        $('#managePersonnelDoubleRight').attr('title', '');
      }
      else {
        $('#managePersonnelDoubleRight').attr('disabled', true);
        if ($('#managePersonnelShownList').children().length) {
          $('#managePersonnelDoubleRight').attr('title', this.get('messageTexts.title_text_no_personnel_selected'));
        }
        else {
          $('#managePersonnelDoubleRight').attr('title', this.get('messageTexts.title_text_no_personnel'));
        }
      }
    },
    personnelHiddenChange() {
      if ($('#managePersonnelHiddenList :selected').length) {
        $('#managePersonnelDoubleLeft').attr('disabled', false);
        $('#managePersonnelDoubleLeft').attr('title', '');
      }
      else {
        $('#managePersonnelDoubleLeft').attr('disabled', true);
        if ($('#managePersonnelHiddenList').children().length) {
          $('#managePersonnelDoubleLeft').attr('title', this.get('messageTexts.title_text_no_personnel_selected'));
        }
        else {
          $('#managePersonnelDoubleLeft').attr('title', this.get('messageTexts.title_text_no_personnel'));
        }
      }
    },
    managePersonnel() {
      this.send('clearSuccessMessages');

      if ($('#managePersonnelShownList').children().length) {
        $('#managePersonnelDoubleRight').attr('title', this.get('messageTexts.title_text_no_personnel_selected'));
      }
      else {
        $('#managePersonnelDoubleRight').attr('title', this.get('messageTexts.title_text_no_personnel'));
      }
      if ($('#managePersonnelHiddenList').children().length) {
        $('#managePersonnelDoubleLeft').attr('title', this.get('messageTexts.title_text_no_personnel_selected'));
      }
      else {
        $('#managePersonnelDoubleLeft').attr('title', this.get('messageTexts.title_text_no_personnel'));
      }
    },
    updateBudgetPersonnel() {
      const srPersonList = this.get('seniorPersonnel');
      for (let i = 0; i < srPersonList.length; i += 1) {
        if (srPersonList[i].get('shadowHidden') !== srPersonList[i].get('hidden')) {
          // first check to see if they have associated budget data, if so do not update yet and show warning
          if (srPersonList[i].hasData() && this.get('updateBudgetPersonnelReady') !== true) {
            this.set('managePersonnelModalMessage', this.get('messageTexts.warning_personnel_data'));
            this.set('updateBudgetPersonnelReady', true);
            return;
          }
        }
      }
      for (let i = 0; i < srPersonList.length; i += 1) {
        if (srPersonList[i].get('shadowHidden') !== srPersonList[i].get('hidden')) {
          srPersonList[i].set('hidden', srPersonList[i].get('shadowHidden'));
          srPersonList[i].clearData();
        }
      }
      this.set('isBudgetPersonnelModified', false);
      this.set('isBudgetModified', true);
      this.set('managePersonnelModalMessage', null);

      $('#managePersonnelModal').modal('hide');

      const message = {status: 'success', dismissable: true, message: this.get('messageTexts.success_updatePersonnel')};
      this.get('messageService').addMessage(message);
    },
    cancelBudgetPersonnel() {
      this.set('updateBudgetPersonnelReady', true);
      this.set('isBudgetPersonnelModified', false);
      this.set('managePersonnelModalMessage', null);
      const srPersonList = this.get('seniorPersonnel');
      for (let i = 0; i < srPersonList.length; i += 1) {
        if (srPersonList[i].get('shadowHidden') !== srPersonList[i].get('hidden')) {
          srPersonList[i].set('shadowHidden', srPersonList[i].get('hidden'));
        }
      }
    },
    managePersonnelHide() {
      this.set('updateBudgetPersonnelReady', false);
      this.set('isBudgetPersonnelModified', true);
      // grab selected from shown list
      const srPersonList = this.get('seniorPersonnel');
      $('#managePersonnelShownList :selected').each(function() {
        for (let i = 0; i < srPersonList.length; i += 1) {
          if (srPersonList[i].get('propPersId') === $(this).val()) {
            srPersonList[i].set('shadowHidden', true);
          }
        }
      });
      let shownCount = 0;
      let hiddenCount = 0;
      for (let i = 0; i < srPersonList.length; i += 1) {
        if (srPersonList[i].get('shaddowHidden') == false) { shownCount += 1; }
        else { hiddenCount += 1; }
      }
      $('#managePersonnelDoubleRight').attr('disabled', true);
      if (hiddenCount) {
        $('#managePersonnelDoubleLeft').attr('title', this.get('messageTexts.title_text_no_personnel_selected'));
      }
      else {
        $('#managePersonnelDoubleLeft').attr('title', this.get('messageTexts.title_text_no_personnel'));
      }
      if (shownCount) {
        $('#managePersonnelDoubleRight').attr('title', this.get('messageTexts.title_text_no_personnel_selected'));
      }
      else {
        $('#managePersonnelDoubleRight').attr('title', this.get('messageTexts.title_text_no_personnel'));
      }
    },
    managePersonnelShow() {
      this.set('updateBudgetPersonnelReady', false);
      this.set('isBudgetPersonnelModified', true);
      // grab selected from hidden list
      const srPersonList = this.get('seniorPersonnel');
      $('#managePersonnelHiddenList :selected').each(function() {
        for (let i = 0; i < srPersonList.length; i += 1) {
          if (srPersonList[i].get('propPersId') === $(this).val()) {
            srPersonList[i].set('shadowHidden', false);
          }
        }
      });
      let shownCount = 0;
      let hiddenCount = 0;
      for (let i = 0; i < srPersonList.length; i += 1) {
        if (srPersonList[i].get('shadowHidden') == false) { shownCount += 1; }
        else { hiddenCount += 1; }
      }
      $('#managePersonnelDoubleLeft').attr('disabled', true);
      if (hiddenCount) {
        $('#managePersonnelDoubleLeft').attr('title', this.get('messageTexts.title_text_no_personnel_selected'));
      }
      else {
        $('#managePersonnelDoubleLeft').attr('title', this.get('messageTexts.title_text_no_personnel'));
      }
      if (shownCount) {
        $('#managePersonnelDoubleRight').attr('title', this.get('messageTexts.title_text_no_personnel_selected'));
      }
      else {
        $('#managePersonnelDoubleRight').attr('title', this.get('messageTexts.title_text_no_personnel'));
      }
    },

    exitBudgetConfirmed() {
      this.set('isBudgetModified', false); // clear isBudgetModified so navigation is not blocked again
      this.transitionToRoute(this.get('exitBudgetTransition'));// navigate to exitBudgetTransition
      this.set('exitBudgetTransition', null); // clear exitBudgetTransition property for the future
    },
    exitBudgetCancelled() {
      // revert proposal-nav focus state to Budgets
      $('#allItems li').removeClass('activated');
      $('[data-test-nav-budgets]').addClass('activated');

      this.set('exitBudgetTransition', null);
    },

    saveBudget() {
      // Check if funds have been removed for postdoc scholars
      // original state would be enableAccess is true
      // new state would have to be false
      if (!this.hasPostDocBudgetValue()) {
        if (this.get('hasPostDocPlan') && this.get('hasPostDocPlan').value && this.get('hasPostDocPlan').value.postDocPlan && this.get('hasPostDocPlan').value.postDocPlan.filePath) {
          // show remove postdoc confirmation modal first.
          $('html,body').stop(true, false).animate({scrollTop: 0}, 'slow');
          $('#deletePostDocConfirmationModal').modal();
          return;
        }
      }
      this.send('saveBudgetConfirmed');
      this.get('analytics').trackEvent('Save button_Budget page');
    },

    saveBudgetCancelled() {
      $('#deletePostDocConfirmationModal').hide();
    },

    saveBudgetConfirmed() {
      $('#deletePostDocConfirmationModal').hide();

      this.set('isFormSubmission', true);
      this.get('messageService').clearActionMessages();
      // Prevent saving if any live validation messages exist
      if ($('.error-tooltip').length) {
        const budgetDataToSave = this.gatherBudgetData();
        this.get('messageService').clearActionMessages();

        this.set('isSaving', true);

        this.get('budgetService').validateBudget(budgetDataToSave).then(data => {
          let errorFound = false;
          this.set('isSaving', false);

          if (data.messages) {
            for (let i = 0; i < data.messages.length; i += 1) {
              if (data.messages[i].type == 'ERROR') {
                errorFound = true;
                const message = {status: 'error', dismissable: false, message: data.messages[i].description};
                this.get('messageService').addMessage(message);
              }
              else if (data.messages[i].type == 'WARNING') {
                const message = {status: 'warning', dismissable: false, message: data.messages[i].description};
                this.get('messageService').addMessage(message);
              }
              else if (data.messages[i].type == 'INFORMATION') {
                const message = {status: 'info', dismissable: false, message: data.messages[i].description};
                this.get('messageService').addMessage(message);
              }
            }
          }
          this.gatherLiveValidationErrors(true, errorFound);
          // close all live validation messages
          $('.tooltip').tooltip('hide');
        }, () => {
          const message = {status: 'error', dismissable: false, message: this.get('messageTexts.fail_generic')};
          this.get('messageService').addMessage(message);
          this.gatherLiveValidationErrors(true);
          // close all live validation messages
          $('.tooltip').tooltip('hide');
        });
      }
      else {
        const budgetDataToSave = this.gatherBudgetData();

        // clear messages before saving again
        this.get('messageService').clearActionMessages();

        this.set('isSaving', true);

        this.get('budgetService').saveBudget(budgetDataToSave).then((data) => {
            if (this.get('budgetImpactAlertMsgDisplayAdded') || (this.get('model.isInPFUStatus') && this.get('isBudgetModified') && !this.get('budget.value.institutionBudget.budgetImpactAlertMsgDisplay'))) {
              const message = {status: 'info', dismissable: false, message: this.get('messageTexts.info_budget_impact_statement'), level: this.get('messageService').LEVEL_SCREEN};
              this.get('messageService').addMessage(message);
            }

            this.set('isBudgetModified', false);

            if (data.messages) {
              // var errorFound = false;
              for (let i = 0; i < data.messages.length; i += 1) {
                if (data.messages[i].type == 'ERROR') {
                  // errorFound = true;
                  const message = {status: 'error', dismissable: false, message: data.messages[i].description};
                  this.get('messageService').addMessage(message);
                }
                else if (data.messages[i].type == 'WARNING') {
                  const message = {status: 'warning', dismissable: false, message: data.messages[i].description};
                  this.get('messageService').addMessage(message);
                }
                else if (data.messages[i].type == 'INFORMATION') {
                  const message = {status: 'info', dismissable: false, message: data.messages[i].description};
                  this.get('messageService').addMessage(message);
                }
                else if (data.messages[i].type == 'SUCCESS') {
                  const message = {status: 'success', dismissable: false, message: data.messages[i].description};
                  this.get('messageService').addMessage(message);
                }
              }

              const message = {status: 'success', dismissable: true, message: this.get('messageTexts.success_upload')};
              this.get('messageService').addMessage(message);
            }

            this.checkPostDocAlert();
          },
          () => {
            const message = {status: 'error', dismissable: false, message: this.get('messageTexts.fail_generic')};
            this.get('messageService').addMessage(message);
          }).then(() => {
          this.set('isSaving', false);
        });
      }
    },

    getBudget() {
      const propId = this.get('propPrepId');
      const revId = this.get('propRevId');
      const sectionCode = this.get('sectionCode');
      const instId = this.get('institutionId');
      this.set('budgetDataLoading', true);

      this.get('budgetService').getBudget({propId, revId, sectionCode, instId}).then((data) => {
          this.set('budgetDataLoading', false);
          this.set('budget', {state: 'fulfilled', value: data});
          this.initBudgetYears();
          this.get('messageService').clearActionMessages();

          if (data.institutionBudget.budgetImpactAlertMsgDisplay) {
            const message = {status: 'info', dismissable: false, message: this.get('messageTexts.info_budget_impact_statement'), level: this.get('messageService').LEVEL_SCREEN};
            this.get('messageService').addMessage(message);
            this.set('budgetImpactAlertMsgDisplayAdded', true);
          }

          if (data && data.messages && data.messages.length && data.messages.length !== 0) {
            for (let i = 0; i < data.messages.length; i += 1) {
              if (data.messages[i].type === 'ERROR') {
                const message = {status: 'error', dismissable: false, message: data.messages[i].description};
                this.get('messageService').addMessage(message);
              }
              else if (data.messages[i].type === 'WARNING') {
                const message = {status: 'warning', dismissable: true, message: data.messages[i].description};
                this.get('messageService').addMessage(message);
              }
              else if (data.messages[i].type === 'INFO') {
                const message = {status: 'info', dismissable: false, message: data.messages[i].description};
                this.get('messageService').addMessage(message);
              }
            }
          }
        }, () => {
          this.set('budgetDataLoading', false);
          // @TODO need some error handling for if GET fails
          this.set('budget', {state: 'failed', value: []});
          this.initBudgetYears();
        });
    },

    clearInfoMessages() {
      this.get('messageService').clearActionMessagesByStatus('info');
    },
    clearSuccessMessages() {
      this.get('messageService').clearActionMessagesByStatus('success');
    },
    toggleChevron(toggleTarget) {
      $(`a[href='${toggleTarget}']`).toggleClass('fa-plus-circle fa-minus-circle');
    },
    expandAll() {
      $(".budget-table a[data-toggle='collapse']").removeClass('fa-plus-circle').addClass('fa-minus-circle');
      $('.budget-table .collapse').collapse('show');
    },
    collapseAll() {
      $(".budget-table a[data-toggle='collapse']").removeClass('fa-minus-circle').addClass('fa-plus-circle');
      $('.budget-table .collapse').collapse('hide');
    },


    addLineItem(items, type) {
      let newLineItem;
      if (type === 'rated') {
        newLineItem = RatedLineItem.create();
      }
      else {
        newLineItem = LineItem.create();
      }
      const numYears = this.get('years').length;
      for (let i = 1; i < numYears; i += 1) {
        newLineItem.addYear();
      }
      items.pushObject(newLineItem);
    },
    deleteLineItem(items, itemToDelete, type) {
      const self = this;
      $('#deleteItemModal').on('show.bs.modal', function() {
        self.set('modalType', type);
        if (type !== 'equipment') {
          type += ' item';
        }
        self.set('modalTypeUC', capitalizeFirstLetters(type));
        self.set('modalDeleteItems', items);
        self.set('modalDeleteLineItem', itemToDelete);
      });
    },
    confirmDeleteLineItem (items, itemToDelete, section) {
      items.removeObject(itemToDelete);
      this.send('nameConflictValidation', section, true);
    },
    selectCopyYear(year) {
      this.set('addType', 'copy');
      if (isEmpty(year)) {
        this.set('copyYear', null);
      }
      else {
        this.set('copyYear', year);
      }
    },
    clearAddYearModal() {
      if (this.get('yearWarningShown') == null) {
        this.set('yearWarningShown', false);
      }
      this.set('addYearModalMessage', null);
      this.set('addType', null);
      this.set('copyYear', null);
      this.get('analytics').trackEvent('Add Year button_Budget page');
      $('#addYearModal').on('show.bs.modal', function() {
        $('#addYearModal select').prop('selectedIndex', 0);
      });

      // @TODO detect budget years with errors
      const liveErrors = this.gatherLiveValidationErrors(); // returns errorList: [], yearsForMessage
      if (liveErrors.yearsForMessage.length) {
        // If all years have errors, disable copyYear option, remove copyYear select, show full width warning
        if (liveErrors.yearsForMessage.length === this.get('years').length) {
          $('#copyYearRadio input').attr('disabled', true);
          $('#copyYearRadio > label').addClass('disabled');
          $('#copyYearRadioLabel').hide();

          for (let i = 0; i < this.get('years').length; i += 1) {
            $(`#copyYearRadio option[value='${liveErrors.yearsForMessage[i]}']`).attr('disabled', false);
            $(`#copyYearRadio option[value='${liveErrors.yearsForMessage[i]}'] span`).remove();
          }

          this.set('addYearModalMessage', this.get('messageTexts.warning_copy_year_disable'));
        }
        else { // If some years have errors, show half width warning
          $('#copyYearRadio input').attr('disabled', false);
          $('#copyYearRadio > label').removeClass('disabled');
          $('#copyYearRadioLabel').show();

          // first reset all
          $('#copyYearRadio option').attr('disabled', false);
          $('#copyYearRadio option span').remove();
          // now set errors as applicable
          for (let i = 0; i < liveErrors.yearsForMessage.length; i += 1) {
            $(`#copyYearRadio option[value='${liveErrors.yearsForMessage[i]}']`).attr('disabled', true);
            if ($(`#copyYearRadio option[value='${liveErrors.yearsForMessage[i]}'] span`).length == 0) {
              $(`#copyYearRadio option[value='${liveErrors.yearsForMessage[i]}']`).append('<span> (contains errors)</span>');
            }
          }
          this.set('addYearModalMessage', this.get('messageTexts.warning_copy_year'));
        }
      }
      else {
        $('#copyYearRadio input').attr('disabled', false);
        $('#copyYearRadio > label').removeClass('disabled');
        $('#copyYearRadioLabel').show();

        for (let i = 0; i < this.get('years').length; i += 1) {
          $(`#copyYearRadio option[value='${i + 1}']`).attr('disabled', false);
          $(`#copyYearRadio option[value='${i + 1}'] span`).remove();
        }
      }
    },
    clearYearSelect() {
      $('#addYearModal select').prop('selectedIndex', 0);
    },
    setDefaultYear() {
      if (this.get('years').length === 1) {
        $('#addYearModal select').prop('selectedIndex', 1);
        this.set('copyYear', 1);
      }
    },

    addYearProxy() {
      this.set('isBudgetModified', true);
      this.send('addYear');
    },

    addYear() {
      const years = this.get('years');
      years.pushObject(years.length + 1);

      if (this.get('addType') === 'blank') {
        this.addYearToLineItem(this.get('seniorPersonnel'));
        this.addYearToLineItem(this.get('otherPersonnel'));
        this.get('fringeBenefits').addYear();
        this.addYearToLineItem(this.get('equipment'));
        this.addYearToLineItem(this.get('travel'));
        // this.addYearPSCNumParticipants();
        this.get('pscNumParticipants').addYear();
        this.addYearToLineItem(this.get('participantSupportCosts'));
        this.addYearToLineItem(this.get('otherDirectCosts'));
        this.addYearToLineItem(this.get('indirectCosts'));
      }

      if (this.get('addType') === 'copy') {
        const yearToCopy = this.get('copyYear');
        this.copyYearByLineItem(this.get('seniorPersonnel'), yearToCopy);
        this.copyYearByLineItem(this.get('otherPersonnel'), yearToCopy);
        this.get('fringeBenefits').copyYear(yearToCopy);
        this.copyYearByLineItem(this.get('equipment'), yearToCopy);
        this.copyYearByLineItem(this.get('travel'), yearToCopy);
        // this.copyYearPSCNumParticipants(yearToCopy);
        this.get('pscNumParticipants').copyYear(yearToCopy);
        this.copyYearByLineItem(this.get('participantSupportCosts'), yearToCopy);
        this.copyYearByLineItem(this.get('otherDirectCosts'), yearToCopy);
        this.copyYearByLineItem(this.get('indirectCosts'), yearToCopy);
      }
      this.set('shownYearsEnd', this.get('shownYearsEnd') + 1);

      // if shownYears > total years, show info message.
      if (this.get('years').length > this.get('maxYearsShown')) {
        if (this.get('yearWarningShown') == false) {
          const message = {status: 'info', dismissable: false, message: this.get('messageTexts.years_visible_info')};
          this.get('messageService').addMessage(message);
          this.set('yearWarningShown', true);
        }
        else {
          this.send('clearInfoMessages');
        }
      }

      // reset tooltip position
      later(function() {
        $('.tooltip').tooltip('hide').tooltip('show');
      }, 300);
    },
    selectDeleteYear(year) {
      if (isEmpty(year)) {
        this.set('selectedDeleteYear', null);
      }
      else {
        this.set('selectedDeleteYear', year);
      }
    },
    clearDeleteYearModal() {
      this.set('selectedDeleteYear', null);
      this.get('analytics').trackEvent('Delete Year button_Budget page');
      $('#deleteYearModal').on('show.bs.modal', function() {
        $('#deleteYearModal select').prop('selectedIndex', 0);
      });
    },
    deleteYearConfirmation() {
      $('#deleteYearConfirmationModal').on('show.bs.modal', function() {
        $('#deleteYearModal').modal('hide');
        $('#deleteYearConfirmationModal').focus();
      });
    },
    cancelDeleteYearConfirmation() {
      const delYr = this.get('selectedDeleteYear');
      $('#deleteYearModal').modal('show');
      if (delYr != null) {
        $('#deleteYearModal select').prop('selectedIndex', delYr);
      }
      $('#deleteYearModal').focus();
    },
    deleteYearProxy() {
      this.set('isBudgetModified', true);
      this.send('deleteYear');
    },
    deleteYear() {
      this.send('clearInfoMessages');
      this.get('years').popObject();

      const yearToDelete = parseInt(this.get('selectedDeleteYear'), 10);
      this.deleteYearByLineItem(this.get('seniorPersonnel'), yearToDelete);
      this.deleteYearByLineItem(this.get('otherPersonnel'), yearToDelete);
      this.get('fringeBenefits').deleteYear(yearToDelete);
      this.deleteYearByLineItem(this.get('equipment'), yearToDelete);
      this.deleteYearByLineItem(this.get('travel'), yearToDelete);
      // this.deleteYearPSCNumParticipants(yearToDelete);
      this.get('pscNumParticipants').deleteYear(yearToDelete);
      this.deleteYearByLineItem(this.get('participantSupportCosts'), yearToDelete);
      this.deleteYearByLineItem(this.get('otherDirectCosts'), yearToDelete);
      this.deleteYearByLineItem(this.get('indirectCosts'), yearToDelete);
      this.enabled = true;
      later(function() {
        $('.tooltip').tooltip('hide').tooltip('show');
      }, 300);
    },
    slideShownYearsLeft() {
      this.set('shownYearsEnd', this.get('shownYearsEnd') - 1);
    },
    slideShownYearsRight() {
      this.set('shownYearsEnd', this.get('shownYearsEnd') + 1);
    },

    // validation actions
    rateValidation(emberObject, content) {
      this.set('isBudgetModified', true);
      if (!digitsDecimalsPattern.test(content)) {
        set(emberObject, 'rateError', 'The indirect cost rate cannot include letters or special characters');
      }
      else if (twoDecimals.test(content)) {
        set(emberObject, 'rateError', 'Only 1 decimal point is permitted for the indirect cost rate');
      }
      else if (moreThanThreeDecimalsPattern.test(content)) {
        set(emberObject, 'rateError', 'Only 2 decimal places are permitted for the indirect cost rate');
      }
      else if (parseFloat(content) > 999.99) {
        set(emberObject, 'rateError', 'The indirect cost rate cannot exceed 999.99');
      }
      else {
        set(emberObject, 'rateError', null);
      }
    },

    monthValidation(emberObject, section, content) {
      this.set('isBudgetModified', true);
      if (!digitsDecimalsPattern.test(content)) {
        set(emberObject, 'monthError', `${capitalizeFirstLetter(section)} cannot include letters or special characters`);
      }
      else if (twoDecimals.test(content)) {
        set(emberObject, 'monthError', `Only 1 decimal point is permitted for ${section} months`);
      }
      else if (parseFloat(content) > 12) {
        set(emberObject, 'monthError', `Months requested for support of ${section} cannot exceed 12`);
      }
      else if (moreThanThreeDecimalsPattern.test(content)) {
        set(emberObject, 'monthError', `Only 2 decimal places are permitted for ${section} months`);
      }
      else if (content.charAt(0) == '.') {
        set(emberObject, 'months', `0${content}`);
      }
      else {
        set(emberObject, 'monthError', null);
      }
    },
    monthValidationOtherPersonnel(emberObject, section, content) {
      this.set('isBudgetModified', true);
      this.actions.commaFormatFloat(emberObject, content, 'months');

      if (!digitsDecimalsCommasPattern.test(content)) {
        set(emberObject, 'monthError', `${capitalizeFirstLetter(section)} cannot include letters or special characters`);
      }
      else if (twoDecimals.test(content)) {
        set(emberObject, 'monthError', `Only 1 decimal point is permitted for ${section} months`);
      }
      else if (moreThanThreeDecimalsPattern.test(content)) {
        set(emberObject, 'monthError', `Only 2 decimal places are permitted for ${section} months`);
      }
      else if (content.charAt(0) == '.') {
        set(emberObject, 'months', `0${content}`);
      }
      else {
        content = content.replace(/,/g, '');
        if (content > 9999.99) {
          set(emberObject, 'monthError', `Months for ${section} cannot exceed 9999.99`);
        }
        else {
          set(emberObject, 'monthError', null);
        }
      }
    },

    amountValidation(emberObject, section, content) {
      this.set('isBudgetModified', true);
      if (section === 'indirect cost base') {
        this.actions.commaFormat(emberObject, content, 'base');
      }
      else {
        this.actions.commaFormat(emberObject, content, 'value');
      }

      const shouldAddError = !amountPattern.test(content);

      const errorName = (section !== 'indirect cost base') ? 'valueError' : 'baseError';

      if (shouldAddError) {
        if (hasDecimalPattern.test(content)) {
          set(emberObject, errorName, `You cannot enter decimals for the ${section} amount`);
        }
        else {
          if (digitsCommasPattern.test(content)) {
            content = content.replace(/,/g, '');
          }
          else if (errorName === 'baseError') {
            set(emberObject, errorName, `The ${section} cannot include letters or special characters`);
          }
          else {
            set(emberObject, errorName, `Funds for ${section} cannot include letters or special characters`);
          }

          if (content > 99999999) {
            if (errorName === 'baseError') {
              set(emberObject, errorName, `The ${section} amount cannot exceed 99,999,999`);
            }
            else {
              set(emberObject, errorName, `Funds for ${section} cannot exceed 99,999,999`);
            }
          }
        }
      }
      else {
        set(emberObject, errorName, null);
      }
    },
    personnelValidation(emberObject, section, content) {
      this.set('isBudgetModified', true);
      this.actions.commaFormat(emberObject, content, 'persons');

      if (!content || !content.trim()) {
        set(emberObject, 'personError', null);
        return;
      }

      if (hasDecimalPattern.test(content)) {
        set(emberObject, 'personError', `You cannot enter decimals for number of ${section}`);
      }
      else if (!digitsCommasPattern.test(content)) {
        set(emberObject, 'personError', `Number of ${section} cannot include letters or special characters`);
      }
      else if (parseInt(content.replace(/,/g, ''), 10) >= 10000) {
        set(emberObject, 'personError', `Number of ${section} must be less than 10,000`);
      }
      else {
        set(emberObject, 'personError', null);
      }
    },
    commaFormat(emberObject, content, valueToSet) {
      if (!isEmpty(content) && digitsCommasPattern.test(content)) {
        content = content.replace(/,/g, '');
        content = parseInt(content, 10);
        content = content.toString().replace(/\B(?=(?:\d{3})+(?!\d))/g, ',');
        set(emberObject, valueToSet, content);
      }
    },
    commaFormatFloat(emberObject, content, valueToSet) {
      if (!isEmpty(content) && digitsCommasPattern.test(content)) {
        content = content.replace(/,/g, '');
        if (content.charAt(content.length - 1) !== '.') {
          content = parseFloat(content);
        }
        content = content.toString().replace(/\B(?=(?:\d{3})+(?!\d))/g, ',');
        set(emberObject, valueToSet, content);
      }
    },
    rateFormat(emberObject, content) {
      removeLeadingTrailingZeros(emberObject, content, 'rate');
      const curRateValue = get(emberObject, 'rate');
      if (curRateValue == '' || curRateValue == '0.0' || curRateValue == '0.' || curRateValue == '0') {
        set(emberObject, 'rate', '0.00');
      }
    },
    monthFormat(emberObject, content) {
      removeLeadingTrailingZeros(content);
      const curMonthValue = get(emberObject, 'months');
      if (curMonthValue == '' || curMonthValue == '0.0' || curMonthValue == '0.' || curMonthValue == '0') {
        set(emberObject, 'months', '0.00');
      }
    },

    monthFocusIn(emberObject, content) {
      if (content == '0.00') {
        set(emberObject, 'months', '');
      }
    },
    valueFocusIn(emberObject, content) {
      if (content == '0') {
        set(emberObject, 'value', '');
      }
    },
    valueFocusOut(emberObject) {
      const curValue = get(emberObject, 'value');
      if (curValue == '') {
        set(emberObject, 'value', '0');
      }
    },
    personsFocusIn(emberObject, content) {
      if (content == '0') {
        set(emberObject, 'persons', '');
      }
    },
    personsFocusOut(emberObject) {
      const curPersons = get(emberObject, 'persons');
      if (curPersons == '') {
        set(emberObject, 'persons', '0');
      }
    },
    rateFocusIn(emberObject, content) {
      if (content == '0.00') {
        set(emberObject, 'rate', '');
      }
    },
    baseFocusIn(emberObject, content) {
      if (content == '0') {
        set(emberObject, 'base', '');
      }
    },
    baseFocusOut(emberObject) {
      const curBase = get(emberObject, 'base');
      if (curBase == '') {
        set(emberObject, 'base', '0');
      }
    },

    nameConflictValidation(section, readOnly) {
      // make sure we don't edit values while deleting because indexes/dom gets off and values get set incorrectly
      const shouldReadOnly = !!(readOnly);

      const sectionJQuery = (section === 'indirect cost') ? 'indirectCosts' : section;

      const list = this.get(sectionJQuery);
      const listLength = list.length;

      for (let i = 0; i < listLength; i += 1) {
        const matchedArray = [];
        let iName = list[i].name;
        if (iName !== null) {
          iName = iName.trim();
        }

        const inputI = $(`#${sectionJQuery} tr:eq(${i}) td:eq(0)`).find('input');

        for (let j = i; j < listLength; j += 1) {
          if (i === j) { continue; }
          if (!isEmpty(iName) && !isEmpty(list[j].name) && iName.toLowerCase() === list[j].name.trim().toLowerCase()) {
            matchedArray[i] = {
              listElement: list[j],
              sectionName: section
            };
          }
        }
        for (let m = 0; m < matchedArray.length; m += 1) {
          if (matchedArray[m] && matchedArray[m].listElement) {
            set(matchedArray[m].listElement, 'nameError', `You cannot have duplicate ${matchedArray[m].sectionName} names`);
          }
        }

        if (!shouldReadOnly) {
          $(inputI).val(iName);
        }
      }
    },

    viewFile() {
      if ($('.error-tooltip').length) {
        this.get('messageService').clearActionMessages();
        this.set('isFormSubmission', false);

        const years = this.getLiveValidationYears();
        let yearText = (years.length > 1) ? '(Years ' : '(Year ';
        yearText += `${years.join(', ')})`;
        const message = {status: 'error', dismissable: false, message: this.get('messageTexts.fail_print').replace('${yearNums}', yearText)};
        this.get('messageService').addMessage(message);
        // close all live validation messages
        $('.tooltip').tooltip('hide');
      }
      else {
        const urlForViewFile = this.get('props').getReplace('apis.budgets.fileView', [this.get('propPrepId'), this.get('propRevId'), this.get('institutionId')]);
        this.get('customForm').postUrlUserToken(urlForViewFile);
        this.get('analytics').trackEvent('Preview Print button_Budget page');
      }
    },

    nameCharacterValidation(section) {
      this.set('isBudgetModified', true);

      const sectionJQuery = (section === 'indirect cost') ? 'indirectCosts' : section;

      const list = this.get(sectionJQuery);
      const listLength = list.length;

      for (let i = 0; i < listLength; i += 1) {
        const iName = list[i].name;
        const inputI = $(`#${sectionJQuery} tr:eq(${i}) td:eq(0)`).find('input');
        checkNameForErrors(iName, list[i], section, inputI);
      }
    }
  }

});
