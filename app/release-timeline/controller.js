import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';

export default Controller.extend({
  init() {
    this._super(...arguments);
    this.breadCrumbs = [
    {label: 'My Desktop', action: 'exitToMyDesktop'},
    {label: 'Proposal Preparation', path: 'proposal-prep'}
    ],

    this.supportItems = [
    {
      type: 'proposal',
      title: 'Research Proposals',
      intialRelease: true,
      futureRelease: true
    },
    {
      type: 'proposal',
      title: 'Proposal types other than Research (RAPID, EAGER, Fellowship, etc)',
      intialRelease: false,
      futureRelease: true
    },
    {
      type: 'proposal',
      title: 'Non-collaborative Proposals',
      intialRelease: true,
      futureRelease: true
    },
    {
      type: 'proposal',
      title: 'Collaborative Proposals',
      intialRelease: false,
      futureRelease: true
    },
    {
      type: 'proposal',
      title: 'Full Proposals',
      intialRelease: true,
      futureRelease: true
    },
    {
      type: 'proposal',
      title: 'Proposal Submission types other than Full Proposal (Letter of Intent, Preliminary, Renewal, etc.)',
      intialRelease: false,
      futureRelease: true
    },
    {
      type: 'proposal',
      title: 'PAPPG Submissions',
      intialRelease: true,
      intialReleaseNote: 'Full Research only',
      futureRelease: true,
      futureReleaseNote: 'All types'
    },
    {
      type: 'proposal',
      title: 'SBIR/STTR Submissions',
      intialRelease: false,
      futureRelease: true
    },
    {
      type: 'feature',
      title: 'Proposal Submission',
      intialRelease: true,
      futureRelease: true
    },
    {
      type: 'feature',
      title: 'Automated compliance checking (New section by section approach)',
      intialRelease: true,
      futureRelease: true
    },
    {
      type: 'feature',
      title: 'Proposal access for PIs, co-PIs, Other Senior Personnel, Other Authorized Users (OAUs)',
      intialRelease: true,
      futureRelease: true
    },
    {
      type: 'feature',
      title: 'Proposal Access for SPOs and AORs',
      intialRelease: true,
      futureRelease: true
    },
    {
      type: 'feature',
      title: 'Support for multiple fonts',
      intialRelease: true,
      intialReleaseNote: 'Times New Roman,<br/>Symbol only',
      futureRelease: true,
      futureReleaseNote: 'Additional fonts'
    },
    {
      type: 'feature',
      title: 'Proposal File Updates / Budget Revisions',
      intialRelease: true,
      futureRelease: true
    },
    {
      type: 'feature',
      title: 'Email Notifications',
      intialRelease: true,
      futureRelease: true
    },
    {
      type: 'feature',
      title: 'Improved error/warning messages',
      intialRelease: false,
      futureRelease: true
    },
    {
      type: 'feature',
      title: 'Single Sign On links directly to/from FastLane\'s Research Administration module',
      intialRelease: true,
      futureRelease: true
    },
    {
      type: 'feature',
      title: 'Print Proposal',
      intialRelease: true,
      futureRelease: true
    },
    {
      type: 'feature',
      title: 'Delete Proposal',
      intialRelease: false,
      futureRelease: true
    },
    {
      type: 'feature',
      title: 'Withdraw Proposal',
      intialRelease: false,
      futureRelease: true
    },

    {
      type: 'feature',
      title: 'Copy (Clone) Proposal',
      intialRelease: false,
      futureRelease: true
    },
    {
      type: 'section',
      title: 'Proposal Setup Wizard <i>(New)</i>',
      intialRelease: true,
      futureRelease: true
    },
    {
      type: 'section',
      title: 'Main Proposal page',
      intialRelease: true,
      intialReleaseNote: 'Improved organization',
      futureRelease: true,
      futureReleaseNote: 'Tailored by solicitation',
    },
    {
      type: 'section',
      title: 'Budget (New consolidated format)',
      intialRelease: true,
      futureRelease: true
    },
    {
      type: 'section',
      title: 'Manage Personnel <i>(New)</i> (PI, co-PI, Other Senior Personnel, OAUs)',
      intialRelease: true,
      futureRelease: true
    },
    {
      type: 'section',
      title: 'Project Summary (Standardized upload format)',
      intialRelease: true,
      futureRelease: true
    },
    {
      type: 'section',
      title: 'Senior Personnel Documents (New format) (Biosketch, COA, Current and Pending)',
      intialRelease: true,
      futureRelease: true
    },
    {
      type: 'section',
      title: 'All other Research Proposal sections',
      intialRelease: true,
      futureRelease: true
    },
    {
      type: 'section',
      title: 'Submitted Proposals list view',
      intialRelease: true,
      futureRelease: true
    },
    {
      type: 'section',
      title: 'Other Supplementary Documents',
      intialRelease: true,
      intialReleaseNote: 'Single upload',
      futureRelease: true,
      futureReleaseNote: 'Improved upload',
    },
    {
      type: 'section',
      title: 'Single Copy Documents',
      intialRelease: false,
      futureRelease: true,
      futureReleaseNote: 'Separate forms',
    },
    {
      type: 'section',
      title: 'Biological Classification Form',
      intialRelease: false,
      futureRelease: true
    },
    {
      type: 'section',
      title: 'DUE Form',
      intialRelease: false,
      futureRelease: true
    }
    ]


  },

  breadCrumb: 'Initial Release Timeline',

  props: service('properties'),

  proposalTypeItems: computed('supportItems', function() {
    return this.get('supportItems').filterBy('type', 'proposal');
  }),

  featureTypeItems: computed('supportItems', function() {
    return this.get('supportItems').filterBy('type', 'feature');
  }),

  sectionTypeItems: computed('supportItems', function() {
    return this.get('supportItems').filterBy('type', 'section');
  }),

  actions: {
    exitToMyDesktop() {
      if (this.get('props') && this.get('props').uiFeatureToggles && this.get('props').uiFeatureToggles.myDesktopLink) {
        window.open(this.get('props').uiFeatureToggles.myDesktopLink, '_self');
      }
    }
  }

});
