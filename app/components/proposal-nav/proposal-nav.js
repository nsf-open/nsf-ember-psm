import EmberObject from '@ember/object';

const ProposalNavLink = EmberObject.extend({
  init(...args) {
    this._super(...args);

    (['hide', 'toggleOpen']).forEach((key) => {
      this.set(key, this.get(key) || false);
    });

  },

  toggle() {
    this.set('toggleOpen', !this.get('toggleOpen'));
  }
});

const NAV_LINKS = {
  PROPOSAL: ProposalNavLink.create({
    name: 'Proposal',
    link: 'proposal'
  }),
  MANAGE_PERSONNEL: ProposalNavLink.create({
    name: 'Manage Personnel',
    link: 'manage-personnel',
    trackNote: 'Manage Personnel link left nav_Proposal Forms page'
  }),
  COVER_SHEET: ProposalNavLink.create({
    name: 'Cover Sheet',
    link: 'cover-sheet',
    trackNote: 'Cover Sheet link left nav_Proposal Forms page'
  }),
  PROJECT_SUMMARY: ProposalNavLink.create({
    name: 'Project Summary',
    link: 'project-summary',
    trackNote: 'Project Summary link left nav_Proposal Forms page'
  }),
  PROJECT_DESCRIPTION: ProposalNavLink.create({
    name: 'Project Description',
    link: 'project-description',
    trackNote: 'Project Description link left nav_Proposal Forms page'
  }),
  REFERENCES_CITED: ProposalNavLink.create({
    name: 'References Cited',
    link: 'references-cited',
    trackNote: 'References Cited link left nav_Proposal Forms page'
  }),
  BUDGETS: ProposalNavLink.create({
    name: 'Budget(s)',
    link: 'budgets',
    trackNote: 'Budgets link left nav_Proposal Forms page'
  }),
  BUDGET_JUSTIFICATION: ProposalNavLink.create({
    name: 'Budget Justification(s)',
    link: 'budget-justification',
    trackNote: 'Budget Justifications link left nav_Proposal Forms page'
  }),
  FACILITIES_EQUIPMENT: ProposalNavLink.create({
    name: 'Facilities, Equipment and Other Resources',
    link: 'facilities-equipment',
    trackNote: 'Facilities Equipment and Other Resources link left nav_Proposal Forms page'
  }),
  SENIOR_PERSONNEL_DOCUMENTS: ProposalNavLink.create({
    name: 'Senior Personnel Documents',
    link: 'sr-personnel-documents',
    trackNote: 'Senior Personnel Documents link left nav_Proposal Forms page'
  }),
  DATA_MANAGEMENT_PLAN: ProposalNavLink.create({
    name: 'Data Management Plan',
    link: 'data-management-plan',
    trackNote: 'Data Management Plan link left nav_Proposal Forms page'
  }),
  POSTDOCTORAL_MENTORING_PLAN: ProposalNavLink.create({
    name: 'Postdoctoral Mentoring Plan',
    link: 'postdoc-mentoring-plan',
    trackNote: 'Postdoctoral Mentoring Plan link left nav_Proposal Forms page'
  }),
  OTHER_PERSONNEL_BIOGRAPHICAL: ProposalNavLink.create({
    name: 'Other Personnel Biographical Information',
    link: 'other-personnel-bio-info',
    trackNote: 'Other Personnel Biographical Info link left nav_Proposal Forms page'
  }),
  OTHER_SUPPLEMENTARY: ProposalNavLink.create({
    name: 'Other Supplementary Documents',
    link: 'other-supplementary-docs',
    trackNote: 'Other Supplementary Documents link left nav_Proposal Forms page'
  }),
  SUGGESTED_REVIEWERS: ProposalNavLink.create({
    name: 'List of Suggested Reviewers',
    link: 'suggested-reviewers',
    trackNote: 'List of Suggested Reviewers link left nav_Proposal Forms page'
  }),
  REVIEWERS_NOT_TO_INCLUDE: ProposalNavLink.create({
    name: 'List of Reviewers Not to Include',
    link: 'reviewers-not-included',
    trackNote: 'List of Reviewers Not to Include link left nav_Proposal Forms page'
  }),

  PROPOSAL_UPDATE_JUSTIFICATION: ProposalNavLink.create({
    name: 'Proposal Update Justification',
    link: 'proposal-update-justification',
    trackNote: 'Proposal Update Justification link left nav_Proposal Forms page'
  }),

  BUDGET_IMPACT_STATEMENT: ProposalNavLink.create({
    name: 'Budget Impact Statement',
    link: 'budget-impact-statement',
    trackNote: 'Budget Impact Statement link_Proposal Forms page'
  })
};

function getProposalLinks({ proposal, hidePostDoc, hideBudgetImpact }) {
  const isInPFUStatus = proposal.get('isInPFUStatus');

  NAV_LINKS.PROPOSAL_UPDATE_JUSTIFICATION.set('hide', !isInPFUStatus);
  NAV_LINKS.BUDGET_IMPACT_STATEMENT.set('hide', !isInPFUStatus || hideBudgetImpact);
  NAV_LINKS.POSTDOCTORAL_MENTORING_PLAN.set('hide', hidePostDoc);
  NAV_LINKS.PROPOSAL.set('name', proposal.get('shortName'));

  const proposalNavLinks = [
    NAV_LINKS.PROPOSAL,
    NAV_LINKS.MANAGE_PERSONNEL,
    NAV_LINKS.PROPOSAL_UPDATE_JUSTIFICATION,
    ProposalNavLink.create({
      name: 'Required',
      id: 'requiredItems',
      subLinks: [
        NAV_LINKS.COVER_SHEET,
        NAV_LINKS.PROJECT_SUMMARY,
        NAV_LINKS.PROJECT_DESCRIPTION,
        NAV_LINKS.REFERENCES_CITED,
        NAV_LINKS.BUDGETS,
        NAV_LINKS.BUDGET_JUSTIFICATION,
        NAV_LINKS.BUDGET_IMPACT_STATEMENT,
        NAV_LINKS.FACILITIES_EQUIPMENT,
        NAV_LINKS.SENIOR_PERSONNEL_DOCUMENTS,
        NAV_LINKS.DATA_MANAGEMENT_PLAN,
        NAV_LINKS.POSTDOCTORAL_MENTORING_PLAN
      ],
      toggleOpen: true
    }),
    ProposalNavLink.create({
      name: 'Optional',
      id: 'optionalItems',
      subLinks: [
        NAV_LINKS.OTHER_PERSONNEL_BIOGRAPHICAL,
        NAV_LINKS.OTHER_SUPPLEMENTARY,
        NAV_LINKS.SUGGESTED_REVIEWERS,
        NAV_LINKS.REVIEWERS_NOT_TO_INCLUDE
      ],
      toggleOpen: true
    })
  ];

  return proposalNavLinks;
}

export {
  getProposalLinks
}



