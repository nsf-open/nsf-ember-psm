import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import { equal } from '@ember/object/computed';
import { observer } from '@ember/object';
import { later } from '@ember/runloop';
import { run } from '@ember/runloop';
import $ from 'jquery';

export default Component.extend({
  PROPOSAL_CONSTANTS: service('proposal-constants'),
  props: service('properties'),
  activeUser: service('active-user'),

  manualFilter: computed('proposalsType', function() {
    const proposalsType = this.get('proposalsType');
    if (proposalsType === 'inprogress') {
      return false;
    }
    else if (proposalsType === 'submitted') {
      return true;
    }
    return false;
  }),

  noResultsText: computed('proposalsType', function() {
    const proposalsType = this.get('proposalsType');
    if (proposalsType === 'inprogress') {
      return 'There are currently no in progress proposals';
    }
    else if (proposalsType === 'submitted') {
      return 'There are currently no submitted proposals';
    }
    return '';
  }),
  noFilterResultsText: computed('proposalsType', function() {
    const proposalsType = this.get('proposalsType');
    if (proposalsType === 'inprogress') {
      return 'No in progress proposals match the filter criteria';
    }
    else if (proposalsType === 'submitted') {
      return 'No submitted proposals match the filter criteria';
    }
    return '';
  }),

  colspan: computed('proposalsType', function() {
    const proposalsType = this.get('proposalsType');
    if (proposalsType === 'inprogress') {
      return '3';
    }
    else if (proposalsType === 'submitted') {
      return '6';
    }
    return '4';
  }),

  searchPlaceholder: computed('proposalsType', function() {
    const proposalsType = this.get('proposalsType');
    if (proposalsType === 'inprogress') {
      return 'Filter by number, title, or PI name';
    }
    else if (proposalsType === 'submitted') {
      return 'Filter by proposal id or temporary id number';
    }
    return '';
  }),
  searchPlaceholderPI: 'Filter by PI name',

  showPaginationControl: computed('originalList', function() {
    if (this.get('originalList').length < 10) {
      return false;
    }
    return true;
  }),

  actionPopupText: 'The actions column displays any action that is currently allowed for each proposal. Actions may not be available when deadline dates pass, or proposals get assigned to panels, or other actions are in progress.',

  // filter terms
  searchFilter: '',
  searchFilterID: '',
  searchFilterPI: '',
  searchFilterChars: '',
  searchFilterCharsPI: '',

  // sorting
  sortAscending: true,
  sortProperty: null,
  prevSortProp: null,


  init(...args) {
    this._super(...args);

    // original results
    this.originalList = [];
    this.modList = [];

    const { TITLE: WITHDRAWAL_TITLE,
      DESCRIPTION: WITHDRAWAL_DESCRIPTION } = this.get('PROPOSAL_CONSTANTS').WITHDRAWAL_MODAL;

    this.set('TEXT', {
      PFU_BUDGET_REVISION: 'Proposal File Update (PFU) / Budget Revision',
      WITHDRAWALS: {
        TITLE: WITHDRAWAL_TITLE,
        MODAL_BODY: WITHDRAWAL_DESCRIPTION
      }
    });

    this.submittedLinks = [
      {
        dataAttribute: 'submitted-pappg',
        modalId: 'pfuInfoModal',
        text: this.TEXT.PFU_BUDGET_REVISION
      },
      {
        dataAttribute: 'withdrawals',
        modalId: 'withdrawalsModal',
        text: this.TEXT.WITHDRAWALS.TITLE
      }
    ];
  },

  // table striping .table-striped > tbody > tr:nth-of-type(even) { background-color: #f5f7f8 }
  // table striping .table-striped > tbody > tr:nth-of-type(odd) { background-color: #ffffff }

  willInsertElement() {
    this.set('originalList', this.get('proposals'));
    this.set('modList', this.get('proposals').slice(0));
    if (this.get('proposalsType') === 'inprogress') {
      this.set('sortProperty', 'deadlineDateSortIndex');
    }
    else {
      this.set('sortProperty', 'submDateSortIndex');
      this.send('sortBy', 'submDateSortIndex');
    }
  },

  getFilteredModels(searchFilter, searchFilterPI) {
    if (this.originalList == null) {
      return [];
    }
    if (searchFilter === '' && (this.get('proposalsType') === 'submitted' && searchFilterPI === '')) {
      return this.modList;
    }

    const output = [];
    const regexSearchTerm = new RegExp(this.escapeRegExp(searchFilter), 'i');
    let regexSearchTerm2 = ''
    if (searchFilterPI) {
      regexSearchTerm2 = new RegExp(this.escapeRegExp(searchFilterPI), 'i');
    }
    const proposalsType = this.get('proposalsType');

    if (proposalsType === 'submitted') {
      this.modList.forEach(function(m) {
        if (searchFilterPI === '') {
          if (regexSearchTerm.test(m.propPrepId) || regexSearchTerm.test(m.nsfPropId)) {
            output.pushObject(m);
          }
        }
        else if (searchFilter === '') {
          if (regexSearchTerm2.test(m.piLastName)) {
            output.pushObject(m);
          }
        }
        else if ((regexSearchTerm.test(m.propPrepId) || regexSearchTerm.test(m.nsfPropId)) && regexSearchTerm2.test(m.piLastName)) {
          output.pushObject(m);
        }
      });
    }
    else {
      this.modList.forEach(function(m) {
        if (regexSearchTerm.test(m.title) || regexSearchTerm.test(m.propPrepId) || regexSearchTerm.test(m.piLastName)) {
          output.pushObject(m);
        }
      });
    }


    return output;
  },
  escapeRegExp(str) {
    return str.replace(/[-[\]/{}()*+?.\\^$|]/g, '\\$&');
  },

  liveFilter: computed('searchFilter', 'modList.{isLoaded,[]}', function() {
    const searchFilter = this.get('searchFilter').trim();
    if (searchFilter === '') {
      return this.modList;
    }
    else {
      this.resetCurrentPage();
      return this.getFilteredModels(searchFilter);
    }
  }),
  nonliveFilter: computed('modList.{isLoaded,[]}', function() {
    const searchFilterID = this.get('searchFilterID').trim();
    const searchFilterPI = this.get('searchFilterPI').trim();
    if (searchFilterID === '' && searchFilterPI === '') {
      return this.modList;
    }
    else {
      this.resetCurrentPage();
      return this.getFilteredModels(searchFilterID, searchFilterPI);
    }
  }),

  recordsShown: computed('liveFilter', 'nonliveFilter', 'startRecord', 'endRecord', function() {
    if (this.get('manualFilter')) {
      return this.get('nonliveFilter').slice(this.get('startRecord') - 1, this.get('endRecord'));
    }
    else {
      return this.get('liveFilter').slice(this.get('startRecord') - 1, this.get('endRecord'));
    }
  }),

  liveFilterLength: computed('liveFilter', 'nonliveFilter', function() {
    if (this.get('manualFilter')) {
      return this.get('nonliveFilter').length;
    }
    else {
      return this.get('liveFilter').length;
    }
  }),

  isSortByPropPrepId: equal('sortProperty', 'propPrepIdNumeric'),
  isSortByProposalTitle: equal('sortProperty', 'title'),
  isSortByLastUpdated: equal('sortProperty', 'lastUpdated'),
  isSortByDeadlineDateSortIndex: equal('sortProperty', 'deadlineDateSortIndex'),
  isSortByPropId: equal('sortProperty', 'nsfPropIdNumeric'),
  isSortByStatus: equal('sortProperty', 'status'),
  isSortByPIName: equal('sortProperty', 'piName'),
  isSortBySubmitDate: equal('sortProperty', 'submDateSortIndex'),
  isSortByProposalStatus: equal('sortProperty', 'proposalStatus'),

  secondarySort: computed('sortProperty', function() {
      const currentSort = this.get('sortProperty');
      if (currentSort === 'propPrepIdNumeric') {
        return 'title';
      }
      else if (currentSort === 'proposalStatus') {
        return 'proposalStatusDesc';
      }
      return 'propPrepIdNumeric';
  }),
  tertiarySort: computed('sortProperty', function() {
    const currentSort = this.get('sortProperty');
    if (currentSort === 'propPrepIdNumeric' || currentSort === 'title') {
      if (this.get('proposalsType') === 'inprogress') {
        return 'deadlineDateSortIndex';
      }
      return 'submDateSortIndex';
    }
    else if (currentSort === 'proposalStatus') {
      return 'propPrepIdNumeric';
    }
    return 'title';
  }),

  isSortDesc: equal('sortAscending', false),
  isSortAsc: equal('sortAscending', true),

  sortData: observer('sortProperty', function() {
    if (this.sortProperty === null) {
      this.setProperties({
        sortAscending: true,
        prevSortProp: null
      });
      return;
    }

    // find 2nd/3rd/etc sorts and pass those as properties
    const sortedArr = this.modList.sortBy(this.sortProperty, this.get('secondarySort'), this.get('tertiarySort'));

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
    this.resetCurrentPage();
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
    if (this.get('manualFilter')) {
      if (this.get('nonliveFilter').length !== 0 && end > this.get('nonliveFilter').length) {
        end = this.get('nonliveFilter').length;
      }
    }
    else if (this.get('liveFilter').length !== 0 && end > this.get('liveFilter').length) {
      end = this.get('liveFilter').length;
    }
    return end;
  }),

  totalPages: computed('currentPageSize', 'liveFilter', 'nonliveFilter', function() {
    if (this.get('manualFilter')) {
      return Math.ceil(this.get('nonliveFilter').length / this.currentPageSize);
    }
    else {
      return Math.ceil(this.get('liveFilter').length / this.currentPageSize);
    }
  }),

  restripeTable() {
    // Remove table stripes
    $('.table').each(() => {
      run(() => {
        $('tr.primary-row').removeClass('row-odd');
        $('tr.secondary-row').removeClass('row-odd');
      });
    });

    // Fade table stripes back in after re-sort
    later((() => {
      $('.table').each(() => {
        run(() => {
          $('tr.primary-row:odd').addClass('row-odd');
          $('tr.primary-row:odd + .secondary-row').addClass('row-odd');
        });
      });
    }), 10);
  },

  actions: {
    onEnterModal(event) {
      if (event.keyCode !== 13) return false;
      const target = event.target;
      const modalSelector = target.dataset.target;
      $(modalSelector).modal('show');
    },
    toggleChevron(propID) {
      $(`a[href$="pfuSubTable${propID}"]`).toggleClass('fa-plus-circle fa-minus-circle');
      $(`a[href$="pfuSubTable${propID}"]`).parent().parent().toggleClass('row-expanded row-collapsed');
    },
    sortBy(property) {
      if (this.sortProperty === property) {
        this.sortData();
      }
      else {
        this.set('sortProperty', property);
      }

      this.restripeTable();
    },
    changePageSize(pageSize) {
      this.set('currentPageSize', pageSize);
      this.resetCurrentPage();
      this.restripeTable();
    },
    keyPressed(string) {
      this.send('characterCount', string);
      if (!string || string.length === 0) {
        this.resetCurrentPage();
      }
    },
    keyPressedPI(string) {
      this.send('characterCountPI', string);
      if (!string || string.length === 0) {
        this.resetCurrentPage();
      }
    },
    searchPressed() {
      const searchFilterID = this.get('searchFilterID').trim();
      const searchFilterPI = this.get('searchFilterPI').trim();
      if (searchFilterID === '' && searchFilterPI === '') {
        this.set('nonliveFilter', this.modList);
      }
      else {
        this.resetCurrentPage();
        this.set('nonliveFilter', this.getFilteredModels(searchFilterID, searchFilterPI));
      }
      this.restripeTable();
    },
    characterCount(string) {
      if (!string) { this.set('searchFilterChars', 0); }
      else { this.set('searchFilterChars', string.length); }
    },
    characterCountPI(string) {
      if (!string) { this.set('searchFilterCharsPI', 0); }
      else { this.set('searchFilterCharsPI', string.length); }
    },
    clear() {
      this.set('searchFilter', '');
      this.send('characterCount', this.get('searchFilter'));
      this.resetCurrentPage();
    }
  }

});
