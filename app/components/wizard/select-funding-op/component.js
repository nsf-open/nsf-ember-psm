import Component from '@ember/component';
import { computed } from '@ember/object';
import { isEmpty } from '@ember/utils';
import { isEqual } from '@ember/utils';
import { observer } from '@ember/object';
import $ from 'jquery';

export default Component.extend({

  init() {
    this._super(...arguments);
    this.fundingOpp = {
      infoTitle: 'Funding Opportunity Number',
      infoText: 'Funding opportunities and the associated NSF numbers are available on '
    },
    this.modList = []
  },

  // filter terms
  searchFilter: '',

  // sorting
  sortAscending: true,
  sortProperty: '',
  prevSortProp: null,

  nextDisabledTitleText: 'Please select a funding opportunity to proceed.',

  willInsertElement() {
    this.set('modList', this.get('fundingOps').slice(0));
    const wizard = this.get('wizard');
    const currentFundingOp = wizard.get('fundingOp');
    if (currentFundingOp) {
      wizard.set('fundingOpChoice', currentFundingOp);
    }
    // this.set('liveFilter', this.get('modList'));
    // this.set('sortProperty','fundingOpportunityId'); // use this if we want a default sort by fundingOpportunityId
  },

  getFilteredModels(searchFilter) {
    if (isEmpty(searchFilter)) { return this.get('modList'); }

    searchFilter = this.get('searchFilter').trim();

    const output = [];
    const regexSearchTerm = new RegExp(this.escapeRegExp(searchFilter), 'i');

    this.get('modList').forEach(function(m) {
      if (regexSearchTerm.test(m.fundingOpportunityTitle) || regexSearchTerm.test(m.fundingOpportunityId)) {
        output.pushObject(m);
      }
    });

    return output;
  },
  escapeRegExp(str) {
    return str.replace(/[-[\]/{}()*+?.\\^$|]/g, '\\$&');
  },

  liveFilter: computed('searchFilter', 'modList.isLoaded', function() {
    this.resetCurrentPage();
    return this.getFilteredModels(this.get('searchFilter'));
  }),

  recordsShown: computed('liveFilter', 'startRecord', 'endRecord', function() {
    return this.get('liveFilter').slice(this.get('startRecord') - 1, this.get('endRecord'));
  }),

  isSortById: computed('sortProperty', function() {
    return (this.get('sortProperty') === 'fundingOpportunityId');
  }),
  isSortByTitle: computed('sortProperty', function() {
    return (this.get('sortProperty') === 'fundingOpportunityTitle');
  }),
  isSortDesc: computed('sortAscending', function() {
    return (this.get('sortAscending') === false);
  }),
  isSortAsc: computed('sortAscending', function() {
    return (this.get('sortAscending') === true);
  }),

  // sortData: computed('sortProperty', function() {
  sortData: observer('sortProperty', function() {
    if (this.sortProperty === null) {
      this.setProperties({
        sortAscending: true,
        prevSortProp: null
      });
      return;
    }
    const sortedArr = this.get('modList').sortBy(this.sortProperty);

    if (this.prevSortProp === this.sortProperty) {
      const isAscending = this.sortAscending;
      if (isAscending) {
        sortedArr.reverse();
      }
      this.set('sortAscending', !isAscending);
    }
    else {
      this.set('sortAscending', true);
      this.set('prevSortProp', this.sortProperty);
    }
    this.set('modList', sortedArr);
  }),

  // pagination
  currentPage: 1,
  currentPageSize: 10,
  pageSizeSelected: 10,

  resetCurrentPage() {
    this.set('currentPage', 1);
  },

  startRecord: computed('currentPage', 'currentPageSize', function() {
    return (this.currentPageSize * (this.currentPage - 1)) + 1;
  }),
  endRecord: computed('currentPage', 'currentPageSize', function() {
    let end = this.currentPage * this.currentPageSize;
    if (this.get('liveFilter').length !== 0 && end > this.get('liveFilter').length) {
      end = this.get('liveFilter').length;
    }
    return end;
  }),

  totalPages: computed('currentPageSize', 'liveFilter', function() {
    return Math.ceil(this.get('liveFilter').length / this.currentPageSize);
  }),

  nextDisabled: computed('wizard.fundingOpChoice', function() {
    return this.get('wizard').get('fundingOpChoice') === undefined;
  }),

  actions: {
    previous() {
      const wizard = this.get('wizard');
      const currentFundingOp = wizard.get('fundingOp');
      const fundingOpChoice = wizard.get('fundingOpChoice');

      if (currentFundingOp || fundingOpChoice) {
        $('#wizardExitModal').modal('show');
      }
      else {
        this.get('exitWizard')(); // send action to the wizard controller
      }
    },
    next() {
      const wizard = this.get('wizard');
      const currentFundingOp = wizard.get('fundingOp');
      const fundingOpChoice = wizard.get('fundingOpChoice');


      if (fundingOpChoice === undefined) {
        // empty
      }
      else if (currentFundingOp === undefined || isEqual(fundingOpChoice, currentFundingOp)) {
        wizard.set('fundingOp', fundingOpChoice);
        this.get('next')();
      }
      else if (!isEqual(fundingOpChoice, currentFundingOp)) {
        if (undefined === wizard.get('uocs') || wizard.get('uocs').length === 0) {
          wizard.set('directorates', []);
          wizard.set('uocs', []);
          wizard.set('fundingOp', fundingOpChoice);
          this.get('next')();
        }
        else {
          $('#changeFOModal').modal('show');
          return true;
        }
      }
      else {
        wizard.set('directorates', []);
        wizard.set('uocs', []);
        wizard.set('fundingOp', fundingOpChoice);
        this.get('next')();
      }
    },
    revertFO() {
      this.get('next')();
    },
    changeFO() {
      const wizard = this.get('wizard');
      wizard.set('fundingOp', wizard.get('fundingOpChoice'));

      // reset the following pages of wizard
      wizard.set('directorates', []);
      wizard.set('uocs', []);
      wizard.set('proposalType', null);
      wizard.set('submissionType', null);

      this.get('next')();
    },
    sortBy(property) {
      if (this.sortProperty === property) {
        this.sortData();
      }
      else {
        this.set('sortProperty', property);
      }
    },
    changePageSize(pageSize) {
      this.set('currentPageSize', pageSize);
      this.resetCurrentPage();
    },
  }
});
