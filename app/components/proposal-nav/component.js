import Component from '@ember/component';
import { getOwner } from '@ember/application';
import { run } from '@ember/runloop';
import $ from 'jquery';

import { getProposalLinks } from './proposal-nav';


const ProposalNavComponent = Component.extend({
  showMenuHandler: null,
  hideMenuHandler: null,

  didReceiveAttrs() {
    const hideBudgetImpact = this.get('hideBudgetImpact');
    const hidePostDoc = this.get('hidePostDoc');
    const proposal = this.get('proposal');
    const properties = ['proposal', 'hidePostDoc', 'hideBudgetImpact'];

    function previousPropName(name) {
      return `previous${name}`.camelize();
    }

    const retreiveProposalLinks = properties.reduce((accum, currentValue) => {
      const previousKey = previousPropName(currentValue);
      return accum || ( this.get(currentValue) !== this.get(previousKey) );
    });

    if (retreiveProposalLinks) {
      this.set('proposalNavLinks', getProposalLinks({ proposal, hidePostDoc, hideBudgetImpact }));
    }

    properties.forEach((property) => {
      const prop = this.get(property);
      this.set(previousPropName(property), prop);
    });
  },

  // 1. Find current route and match that to menu item to set initial selected state
  // 2. Set top menu item to 'Proposal - ' + current proposal id
  didInsertElement(...args) {
    this._super(...args);
    // get current route and grab just the end, ie. 'proposal.budgets' gets 'budgets'

    // this works for routes unless we use a loading state first
    let currentRoute = getOwner(this).lookup('router:main').get('currentRouteName');

    // this should grab the actual target state not just the loading state
    const currentHandlerInfos = getOwner(this).lookup('router:main').targetState.routerJsState.handlerInfos;
    if (currentHandlerInfos && currentHandlerInfos.length) {
      currentRoute = currentHandlerInfos[currentHandlerInfos.length - 1].name;
    }

    if (currentRoute) {
      currentRoute = currentRoute.substring(currentRoute.indexOf('.') + 1, currentRoute.length);
      if (currentRoute === 'index') {
        this.send('removeMenu');
      }
      else {
        let routeToUse = currentRoute;
        if (routeToUse.indexOf('.') != -1) {
          routeToUse = routeToUse.substring(0, routeToUse.indexOf('.'));
        }
      }
    }

    $('#allItems').collapse({toggle: false});
    const menuText = $('.rgov-left-nav #mainMenu').find('span');

    this.hideMenuHandler = run.bind(this, function (event ) {
      if (event.target.id === 'requiredItems' || event.target.id === 'optionalItems') {
        const navLinkIndex = event.target.parentNode.getAttribute('data-nav-link-index');
        this.toggleNavLink(navLinkIndex);
        return true;
      }

      if (getOwner(this).lookup('controller:proposal.budgets')) {
        getOwner(this).lookup('controller:proposal.budgets').toggleMenuEvent('closed');
      }
      menuText.text('Show Menu');
      $('#pageMenuShown #contents').appendTo('#pageMenuHidden');
    });

    $('#allItems').on('hidden.bs.collapse', this.hideMenuHandler);

    this.showMenuHandler = run.bind(this, function (event) {
      if (event.target.id === 'requiredItems' || event.target.id === 'optionalItems') {
        const navLinkIndex = event.target.parentNode.getAttribute('data-nav-link-index');
        this.toggleNavLink(navLinkIndex);
        return true;
      }

      if (getOwner(this).lookup('controller:proposal.budgets')) {
        getOwner(this).lookup('controller:proposal.budgets').toggleMenuEvent('open');
      }
      menuText.text('Hide Menu');
      $('#pageMenuHidden #contents').appendTo('#pageMenuShown');
    });

    $('#allItems').on('show.bs.collapse', this.showMenuHandler);

    $('#requiredItems').collapse({toggle: false});
    $('#optionalItems').collapse({toggle: false});



  },

  willDestroyElement(...args) {
    this._super(...args);

    $('#allItems').off('hidden.bs.collapse', this.hideMenuHandler);
    $('#allItems').off('show.bs.collapse', this.showMenuHandler);
  },

  toggleNavLink(index) {
    const proposalNavLinks = this.get('proposalNavLinks');
    proposalNavLinks[index].toggle();
  },

  actions: {

    clickNavLink(linkInfo, trackNote) {
      if (linkInfo) {
        // $('#allItems li').removeClass('activated');
        if (linkInfo !== 'proposal') {
          if (linkInfo.indexOf('.') != -1) {
            linkInfo = linkInfo.substring(0, linkInfo.indexOf('.'));
          }
        }
      }

      this.get('onNavLinkClick')({ linkInfo, trackNote});
    },

    toggleMenu() {
      $('#allItems').collapse('toggle');
      $('.psm-container').toggleClass('proposal-menu-hidden');

      // toggle +/- sign
      $('.rgov-left-nav #mainMenu').find('i').toggleClass('fa-minus-square fa-plus-square');

    },

    toggleSubMenu (toggleElemID) {
      $(toggleElemID).collapse('toggle');
      //

    },

    /**
     * removeMenu() and insertMenu() - Initial Component Load
     * move page contents and breadcrumbs as necessary so it has the correct bootstrap layout
     */
    removeMenu() {
      $('.rgov-left-nav').hide();
      setTimeout(function() {
        $('#pageMenuShown #contents').detach().appendTo('#contentsNoMenu');
        $('#breadcrumbsWithMenu > .row').detach().appendTo('#breadcrumbsNoMenu');
      }, 0);
    },
    insertMenu() {
      $('.rgov-left-nav').show();
      setTimeout(function() {
        $('#contentsNoMenu #contents').detach().appendTo('#pageMenuShown');
        $('#breadcrumbsNoMenu > .row').detach().appendTo('#breadcrumbsWithMenu');
      }, 0);
    }

  }

});

ProposalNavComponent.reopenClass({
  positionalParams: ['nsfPropId', 'propPrepId', 'pfuProposals', 'proposalStatus', 'propPrepRevnTypeCode', 'isInPFUStatus']
});

export default ProposalNavComponent;
