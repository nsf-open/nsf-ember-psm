import Component from '@ember/component';
import { computed } from '@ember/object';
import { later } from '@ember/runloop';
import { run } from '@ember/runloop';
import $ from 'jquery';

export default Component.extend({
  classNames: ['pagination'],

  maxLinks: 5, // an odd number for symmetry

  canStepForward: computed('currentPage', 'totalPages', function () {
    return this.currentPage < this.totalPages;
  }),
  canStepBackward: computed('currentPage', function () {
    return this.currentPage > 1;
  }),

  isShowingAll: computed('totalPages', function () {
    return this.totalPages <= 1;
  }),

  links: computed('currentPage', 'totalPages', function () {
    const totalPages = this.totalPages;
    if (totalPages === 1) {
      return [1];
    }
    else if (totalPages < 1) {
      return [];
    }
    const currentPage = this.currentPage;
    const spread = this.maxLinks - 1;
    const halfDistance = spread / 2;

    let firstLink = (currentPage - halfDistance < 1) ? 1 : currentPage - halfDistance;

    let lastLink = firstLink + spread;

    lastLink = (lastLink > totalPages) ? totalPages : lastLink;

    while (firstLink > 1 && (lastLink - firstLink !== spread)) { // firstLink must not go below 1
      firstLink -= 1;
    }

    const links = [];

    for (let i = firstLink; i <= lastLink; i += 1) {
      links.pushObject(i);
    }

    return links;
  }),

  pageSizeSelected: 10,

  resizeSearchBar() {
    const componentElement = this.get('element');
    const containerElement = componentElement.parentNode.parentNode;
    const searchBarElement = containerElement.querySelector('#searchbar-div');
    if (!searchBarElement) return; // - if search bar doesn't exist then don't continue

    const pageSizeElement = componentElement.querySelector('.page-size-dropdown');
    const showingCurrentPageElement = componentElement.querySelector('.showing-current-page');
    const paginationButtonsElement = componentElement.querySelector('.pagination-buttons');
    const pageSizeElemWidth = pageSizeElement.offsetWidth;
    const showingCurrentElemWidth = showingCurrentPageElement.offsetWidth;
    const paginationButtonsElementWidth = paginationButtonsElement.offsetWidth;

    const maxWidth = componentElement.offsetWidth;
    const componentUsedWidth = pageSizeElemWidth + showingCurrentElemWidth
      + paginationButtonsElementWidth;

    function getComputedProperty(element, prop) {
      return window.getComputedStyle(element, null)[prop];
    }

    function getSearchBarPropertyWidth(sbElement, propertyWidths) {
      return propertyWidths.reduce((accum, property) => {
        // -- Gets the property pixel value in number
        function getPropertyInNumber(element, prop) {
          return parseInt(getComputedProperty(element, prop), 10);
        }

        accum += getPropertyInNumber(sbElement, property);

        return accum;
      }, 0);
    }

    const boxSizingValue = getComputedProperty(searchBarElement, 'box-sizing');
    const marginWidthProps = ['marginLeft', 'marginRight'];
    const nonBorderBoxExtraWidthProps = ['paddingLeft', 'paddingRight', 'borderLeftWidth', 'borderRightWidth'];

    /** If box-sizing is 'border-box' then don't include border or padding
          because border-box includes border and padding**/
    const nonBorderBoxWidth = getSearchBarPropertyWidth(searchBarElement, nonBorderBoxExtraWidthProps);
    const marginWidth = getSearchBarPropertyWidth(searchBarElement, marginWidthProps);
    const extraWidth = (boxSizingValue !== 'border-box') ? marginWidth + nonBorderBoxWidth : marginWidth;

    const setSearchBarWidth = 620;
    const fullSearchBarWidth = maxWidth - componentUsedWidth - extraWidth - 1;
    const searchBarWidth = (fullSearchBarWidth < setSearchBarWidth) ? fullSearchBarWidth : setSearchBarWidth;

    searchBarElement.style.width = `${searchBarWidth}px`;
    // Give cushion of 1px because fractional pixels
  },

  init(...args) {
    this._super(...args);
    this.set('boundResizeSearchBar', this.get('resizeSearchBar').bind(this));

    this.pageSizes = [
      { value: 10, label: 'Show 10' },
      { value: 25, label: 'Show 25' },
      { value: 50, label: 'Show 50' },
      { value: 100, label: 'Show 100' },
      { value: 262144, label: 'Show all' }
    ];
  },


  didInsertElement(...args) {
    this._super(...args);
    this.resizeSearchBar();
    window.addEventListener('resize', this.get('boundResizeSearchBar'));
  },

  didRender(...args) {
    this._super(...args);
    this.resizeSearchBar();
  },

  willDestroyElement(...args) {
    this._super(...args);

    window.removeEventListener('resize', this.get('boundResizeSearchBar'));
  },

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

  scrollToTableOffset() {
    // window.scrollTo(0, 0); // don't scroll all the way up anymore
    let tableOffset = $('.table.table-fixed').offset().top;
    if ($('div.pagination').length) { // scroll up to top pagination if it exists
      tableOffset = $('div.pagination').offset().top;
    }
    const documentOffset = $(document).scrollTop();
    if (documentOffset > tableOffset) {
      $('html, body').animate({ scrollTop: tableOffset }, 500);
    }
    this.restripeTable();
  },

  actions: {
    changePageSize(pageSize) {
      pageSize = parseInt(pageSize, 10);
      this.set('pageSizeSelected', pageSize);
      this.get('changePageSize')(pageSize);
    },
    stepForward() {
      if (this.get('canStepForward')) {
        this.incrementProperty('currentPage');
        this.scrollToTableOffset();
      }
    },
    stepBackward() {
      if (this.get('canStepBackward')) {
        this.decrementProperty('currentPage');
        this.scrollToTableOffset();
      }
    },
    goToPage(page) {
      if (this.get('currentPage') !== page) {
        this.scrollToTableOffset();
      }
      this.set('currentPage', page);
    },
    goToFirstPage() {
      if (this.get('currentPage') !== 1) {
        this.scrollToTableOffset();
      }
      this.set('currentPage', 1);
    },
    gotToLastPage() {
      if (this.get('currentPage') !== this.totalPages) {
        this.scrollToTableOffset();
      }
      this.set('currentPage', this.totalPages);
    }
  }

});
