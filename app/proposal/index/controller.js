import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { alias } from '@ember/object/computed';
import { computed } from '@ember/object';
import { isEmpty } from '@ember/utils';
import { htmlSafe } from '@ember/string';
import { set } from '@ember/object';
import $ from 'jquery';
import { run } from '@ember/runloop';

export default Controller.extend({
  activeUser: service('active-user'),
  permissions: service('permissions'),
  proposalStatusService: service('proposal-status'),
  props: service('properties'),
  sectionLookup: service('section-lookup'),
  proposalService: service('proposal'),
  messageService: service('messages'),
  analytics: service('webtrend-analytics'),
  PROPOSAL_CONSTANTS: service('proposal-constants'),
  resolution: service('resolution'),

  componentId: 'deadline-date-div',
  deadlineDate: alias('model.deadline.deadlineDate'),
  deadlineSaveButtonErrorTitle: 'You must select a due date to save',
  editingDeadline: false,
  isEditingTitle: false,
  loadingUpdateBudgetRevisionText: 'Preparing Proposal File Update/Budget Revision',
  /*
     Section requirement options: ['required', 'conditional', 'optional']
  */
  updateBudgetRevisionText: 'Prepare Proposal File Update/Budget Revision',

  init(...args) {
    this._super(...args);

    this.sections = [
      {
        sectionTitle: 'Proposal Update Justification',
        sectionKey: 'PUJ',
        permissionKey: 'proposal.data.modify',
        status: 'notStarted',
        // sectionPath: 'proposal.proposal-update-justification',
        sectionPath: 'proposal.proposal-update-justification',
        enableAccess: true,
        enableDisplay: true,
        requirement: 'requiredPFU',
        trackNote: 'Proposal Update Justification link_Proposal Forms page'
      },
      {
        sectionTitle: 'Cover Sheet',
        sectionKey: 'COVER_SHEET',
        permissionKey: 'proposal.data.modify',
        status: 'notStarted',
        sectionPath: 'proposal.cover-sheet',
        enableAccess: true,
        enableDisplay: true,
        requirement: 'required',
        trackNote: 'Cover Sheet landing page link_Proposal Forms page'
        // complianceHover: "Even if your cover sheet information is fully pre-populated, review and click 'Save' on the Cover Sheet, to update the compliance status"
      },
      {
        sectionTitle: 'Project Summary',
        sectionKey: 'PROJ_SUMM',
        permissionKey: 'proposal.data.modify',
        status: 'notStarted',
        sectionPath: 'proposal.project-summary',
        enableAccess: true,
        enableDisplay: true,
        requirement: 'required',
        trackNote: 'Project Summary link_Proposal Forms page'
      },
      {
        sectionTitle: 'Project Description',
        sectionKey: 'PROJ_DESC',
        permissionKey: 'proposal.data.modify',
        status: 'notStarted',
        sectionPath: 'proposal.project-description',
        enableAccess: true,
        enableDisplay: true,
        requirement: 'required',
        trackNote: 'Project Description link_Proposal Forms page'
      },
      {
        sectionTitle: 'References Cited',
        sectionKey: 'REF_CITED',
        permissionKey: 'proposal.data.modify',
        status: 'notStarted',
        sectionPath: 'proposal.references-cited',
        enableAccess: true,
        enableDisplay: true,
        requirement: 'required',
        trackNote: 'References Cited link_Proposal Forms page'
      },
      {
        sectionTitle: 'Budget(s)',
        sectionKey: 'BUDGETS',
        permissionKey: 'proposal.budget.modify',
        status: 'notStarted',
        sectionPath: 'proposal.budgets',
        enableAccess: true,
        enableDisplay: true,
        requirement: 'required',
        trackNote: 'Budgets link_Proposal Forms page'
      },
      {
        sectionTitle: 'Budget Justification(s)',
        sectionKey: 'BUDGET_JUST',
        permissionKey: 'proposal.budget.modify',
        status: 'notStarted',
        sectionPath: 'proposal.budget-justification',
        enableAccess: true,
        enableDisplay: true,
        requirement: 'required',
        trackNote: 'Budget Justifications link_Proposal Forms page'
      },
      {
        sectionTitle: 'Budget Impact Statement',
        sectionKey: 'BUDI',
        permissionKey: 'proposal.data.modify',
        status: 'notStarted',
        sectionPath: 'proposal.budget-impact-statement',
        enableAccess: true,
        enableDisplay: true,
        requirement: 'conditional',
        pfuOnly: true,
        noteTitle: 'Budget Impact Statement Conditions',
        note: 'The Budget Impact Statement is required if the budget is being reduced by 10% or more from the amount originally proposed.<br><br>If the reduction is less than 10%, a Budget Impact Statement can be supplied but it is not required.',
        trackNote: 'Budget Impact Statement link_Proposal Forms page'
      },
      {
        sectionTitle: 'Facilities, Equipment and Other Resources',
        sectionKey: 'FER',
        permissionKey: 'proposal.data.modify',
        status: 'notStarted',
        sectionPath: 'proposal.facilities-equipment',
        enableAccess: true,
        enableDisplay: true,
        requirement: 'required',
        trackNote: 'Facilities Equipment and Other Resources link_Proposal Forms page'
      },
      {
        sectionTitle: 'Senior Personnel Documents',
        sectionKey: 'SPD',
        permissionKey: 'proposal.personnel.modify',
        status: 'notStarted',
        sectionPath: 'proposal.sr-personnel-documents',
        enableAccess: true,
        enableDisplay: true,
        requirement: 'required',
        noteTitle: '',
        note: 'Required documents for Senior Personnel include: <ul><li>Biographical Sketch</li><li>Current and Pending Support</li><li>Collaborators and Other Affiliations</li></ul>',
        trackNote: 'Senior Personnel Documents link_Proposal Forms page'
      },
      {
        sectionTitle: 'Data Management Plan',
        sectionKey: 'DMP',
        permissionKey: 'proposal.data.modify',
        status: 'notStarted',
        sectionPath: 'proposal.data-management-plan',
        enableAccess: true,
        enableDisplay: true,
        requirement: 'required',
        trackNote: 'Data Management Plan link_Proposal Forms page'
      },
      {
        sectionTitle: 'Postdoctoral Mentoring Plan',
        sectionKey: 'PMP',
        permissionKey: 'proposal.data.modify',
        status: 'notStarted',
        sectionPath: 'proposal.postdoc-mentoring-plan',
        enableAccess: true,
        enableDisplay: true,
        requirement: 'conditional',
        noteTitle: 'Postdoctoral Mentoring Plan Conditions',
        note: 'The Postdoctoral Mentoring Plan is required when the budget has funds indicated in Section B: Other Personnel, for Postdoctoral Scholars for at least one year. When funds are indicated, you will be able to upload up to one page describing the mentoring activities for such individuals.<br><br>In situations where a postdoctoral researcher is listed in Section A of the NSF Budget, and is functioning in a Senior Personnel capacity, a mentoring plan is not required.',
        trackNote: 'Postdoctoral Mentoring Plan link_Proposal Forms page'
      },
      {
        sectionTitle: 'Other Personnel Biographical Information',
        sectionKey: 'OPBIO',
        permissionKey: 'proposal.data.modify',
        status: 'notStarted',
        sectionPath: 'proposal.other-personnel-bio-info',
        enableAccess: true,
        enableDisplay: true,
        requirement: 'optional',
        noteTitle: '',
        note: 'Other personnel include postdoctoral researchers, other professionals, graduate and undergraduate students.',
        singleCopy: false,
        trackNote: 'Other Personnel Biographical Info link_Proposal Forms page'
      },
      {
        sectionTitle: 'Other Supplementary Documents',
        sectionKey: 'OSD',
        permissionKey: 'proposal.data.modify',
        status: 'notStarted',
        sectionPath: 'proposal.other-supplementary-docs',
        enableAccess: true,
        enableDisplay: true,
        requirement: 'optional',
        trackNote: 'Other Supplementary Documents link_Proposal Forms page'
      },
      {
        sectionTitle: 'List of Suggested Reviewers',
        sectionKey: 'SRL',
        permissionKey: 'proposal.data.modify',
        status: 'notStarted',
        sectionPath: 'proposal.suggested-reviewers',
        enableAccess: true,
        enableDisplay: true,
        requirement: 'optional',
        singleCopy: true,
        trackNote: 'List of Suggested Reviewers link_Proposal Forms page'
      },
      {
        sectionTitle: 'List of Reviewers Not to Include',
        sectionKey: 'RNI',
        permissionKey: 'proposal.data.modify',
        status: 'notStarted',
        sectionPath: 'proposal.reviewers-not-included',
        enableAccess: true,
        enableDisplay: true,
        requirement: 'optional',
        singleCopy: true,
        trackNote: 'List of Reviewers Not to Include link_Proposal Forms page'
      }
    ]

    const SYSTEM_ERROR = this.get('PROPOSAL_CONSTANTS').SYSTEM_ERROR;
    const {
      CREATE_REVISION,
      DEADLINE_DATE,
      RETURNED_TO_PI
    } = SYSTEM_ERROR;

    this.set('messageTexts', {
      'fail_generic': RETURNED_TO_PI,
      'fail_initiate_revision': CREATE_REVISION,
      'success_generic': 'Proposal ${propPrepID} has been returned to the Principal Investigator (PI). You are no longer able to access this proposal. Please communicate with the PI that the proposal has been returned and needs further action.',
      'info_noPOInfo': 'Program Officer (PO) information is not yet available, but this page will be updated when the information becomes available.',
      'proposal_status_modal_title': 'Proposal Status',
      'proposal_status_modal_description': 'The following statuses are possible for the proposal.',
      'proposal_status_modal_title_submitted': 'Proposal Status for Submitted Proposals',
      'proposal_status_modal_description_submitted': 'The following statuses are possible for the proposal post-submission, and you can scroll down to see statuses for proposal file updates and budget revisions.',
      'single_copy_title': 'Single-copy document',
      'single_copy_info': 'Reviewers do not see single-copy documents. They are for NSF use only.',
      'no_available_due_dates': 'All due dates for this funding opportunity have passed and none are scheduled in the next 12 months; therefore, this proposal cannot be submitted.',
      'deadline_fail_generic': DEADLINE_DATE,
      'deadline_success_generic': 'The Due Date has been updated successfully.'
    });
  },

  isTabletOrMobile: computed('', function() {
    return this.get('resolution').isTablet || this.get('resolution').isMobile;
  }),

  deadlineDates: computed('model', function () {
    const deadlineDates = this.get('model.dueDates');

    if (!isEmpty(deadlineDates)) {
      deadlineDates.sort((a, b) => {
        const keyA = new Date(a.deadlineDate);
        const keyB = new Date(b.deadlineDate);
        if (keyA < keyB) {
          return -1;
        }
        if (keyA > keyB) {
          return 1;
        }
        return 0;
      });
    }

    return deadlineDates;
  }),

  deadlineType: computed('model.deadline.deadlineTypeCode', 'deadlineDates', function() {
    const typeCode = this.get('model.deadline.deadlineTypeCode');
    const deadlineDates = this.get('deadlineDates');

    if (typeCode) {
      if (typeCode === '1') {
        return 'Target';
      }
      if (typeCode === '2') {
        return 'Deadline';
      }
      if (typeCode === '4') {
        return 'Window';
      }
    }
    else if (!typeCode && deadlineDates && !isEmpty(deadlineDates)) {
      const deadlineDatesTypes = deadlineDates.uniqBy('deadlineTypeCode');

      if (deadlineDatesTypes.length > 1) {
        return 'Determined by due date';
      }
      else {
        return deadlineDatesTypes[0].deadlineTypeDesc;
      }
    }
    else { return ''; }
  }),

  deadlineDateRequired: computed('model', 'deadlineDates', function() {
    const deadlineDates = this.get('deadlineDates');
    if (deadlineDates && deadlineDates.length > 1) {
      return true;
    }
    return false;
  }),

  deadlineDateReadonly: computed('deadlineDate', 'deadlineDates', 'isAcceptedAnytime', function() {
    const deadlineDates = this.get('deadlineDates');
    const deadlineDate = this.get('deadlineDate');

    // Accepted Anytime then date will be read only
    if (this.get('isAcceptedAnytime')) {
      return true;
    }
    // If there is a deadlineDate already set and there is only 1 option, then readonly
    if (deadlineDate && deadlineDates && deadlineDates.length === 1) {
      return true;
    }
    // If there are no dropdown options available, then readonly
    if (isEmpty(deadlineDates)) {
      return true;
    }
    return false;
  }),

  deadlineDateUnavailable: computed('deadlineDate', 'deadlineDates', 'isAcceptedAnytime', function() {
    const deadlineDates = this.get('deadlineDates');
    const deadlineDate = this.get('deadlineDate');
    if (isEmpty(deadlineDates) && !deadlineDate && !this.get('isAcceptedAnytime')) {
      return htmlSafe('No dates available <span style="font-size: 14px;">(cannot submit)</span>');
    }
    return '';
  }),

  deadlineDateSaveIsDisabled: computed('selectedDate', function() {
    if (isEmpty(this.get('selectedDate'))) {
      return true;
    }
    return false
  }),

  isAcceptedAnytime: computed('model.deadline.deadlineTypeCode', function() {
    const deadlineTypeCode = this.get('model.deadline.deadlineTypeCode');
    if (deadlineTypeCode === '3') {
      return true;
    }
    return false;
  }),

  notSubmittable: computed('model.{deadline,propPrepRevnTypeCode}', 'deadlineDates', function() {
    // Temporary fix to allow submit to be enabled for PFU/BR
    if (this.get('model.propPrepRevnTypeCode') !== 'ORIG') {
      return false;
    }

    if (this.get('model.deadline').deadlineTypeCode === '3') { // Accepted Anytime
      return false;
    }

    const chosenDeadline = (this.get('deadlineDate') == null) ? {} : this.get('deadlineDate');
    const chosenDeadlineDate = moment(chosenDeadline);

    const onemonthAgo = moment().subtract(1, 'months');
    const oneYearFuture = moment().add(1, 'years');

    if (!chosenDeadlineDate.isBetween(onemonthAgo, oneYearFuture, null, '[]') || isEmpty(this.get('deadlineDates'))) {
      return true;
    }
    return false;
  }),

  currentUserRole: computed('permissions.roles.[]', function () {
    const permissions = this.get('permissions');
    const currentRoles = permissions.get('roles').content;
    let retVal = '';
    for (let i = 0; i < currentRoles.length; i += 1) {
      if (currentRoles[i].description && currentRoles[i].abbreviation) {
        if (i !== 0) {
          retVal += ', ';
        }
        retVal += `${currentRoles[i].description} (${currentRoles[i].abbreviation})`;
      }
    }
    return retVal;
  }),

  availableForRevision: computed('model.isAvailableForRevision', 'permissions.roles.[]', function() {
    const permissions = this.get('permissions');
    const currentRoles = permissions.get('roles').content;
    let isPIorCOPI = false;
    for (let i = 0; i < currentRoles.length; i += 1) {
      if (currentRoles[i].abbreviation === 'PI' || currentRoles[i].abbreviation === 'co-PI') {
        isPIorCOPI = true;
      }
    }
    if (this.get('model').isAvailableForRevision && isPIorCOPI && this.get('model').nsfPropId) {
      return true;
    }
    return false;
  }),

  allowIndicatorLabels: computed('model.proposalStatus', function() {
    const proposalStatus = this.get('model').proposalStatus;
    if (proposalStatus === '07' || proposalStatus === '08' || proposalStatus === '09'
      || proposalStatus === '10' || proposalStatus === '11' || proposalStatus === '12'
      || proposalStatus === '13' || proposalStatus === '14' || proposalStatus === '15' || proposalStatus === '16') {
      return true;
    }
    return false;
  }),

  showSubmittedData: computed('model.proposalStatus', function () {
    const proposalStatus = this.get('model').proposalStatus;
    if (proposalStatus === '05' || proposalStatus === '06') {
      return true;
    }
    return false;
  }),

  lastSubmittedVersion: computed('model.proposalStatus', function () {
    const proposalStatus = this.get('model').proposalStatus;
    const latestSubmittedRevId = this.get('model').latestSubmittedRevId;
    if (proposalStatus === '07' || proposalStatus === '08' || proposalStatus === '09'
      || proposalStatus === '10' || proposalStatus === '11' || proposalStatus === '12'
      || proposalStatus === '13' || proposalStatus === '14' || proposalStatus === '15' || proposalStatus === '16') {
      if (latestSubmittedRevId) {
        return true;
      }
    }
    return false;
  }),

  proposalStatusNumber: computed('model.proposalStatus', function() {
    if (this.get('model').proposalStatus) {
      return parseInt(this.get('model').proposalStatus, 10);
    }
    return this.get('model').proposalStatus;
  }),

  proposalTitle: computed('model.proposalTitle', function() {
    return this.get('model').proposalTitle;
  }),

  printProposalUrl: computed('model.{propPrepId,propRevId}', function() {
    const urlForViewFile = this.get('props').getReplace('apis.proposal.apiProposalFileView', [this.get('model.propPrepId'), this.get('model.propRevId')]);
    return urlForViewFile; // use for value in template file - want it to be dynamic - define it like this, recompute this value, everytime one of those two properties changes, dont have to wait for something to be loaded, computed propoerties takes care of that
  }),

  lastSubmittedProposal: computed('model.{propPrepId,latestSubmittedRevId}', function() {
    const urlForViewFile = this.get('props').getReplace('apis.proposal.apiProposalFileView', [this.get('model.propPrepId'), this.get('model.latestSubmittedRevId')]);
    return urlForViewFile;
  }),

  submittedProposalsDisabled: computed('props', function() {
    if (this.get('props').uiFeatureToggles.disableViewSubmittedProposals) {
      return true;
    }
    return false;
  }),

  submittedProposalsDisabledText: computed('submittedProposalsDisabled', function() {
    if (this.get('submittedProposalsDisabled')) {
      return this.get('props').uiFeatureToggles.disabledTextDefault;
    }
    return '';
  }),

  orderedUocs: computed('model.uocs', function() {
    return this.get('model.uocs').sortBy('uocOrdrNum');
  }),

  /*
   * reInit - GET a new status on postdoc every time the page is loaded
   */
  reInit() {
    this.get('sectionLookup').loadForProposal(this.get('model.propPrepId'), this.get('model.propRevId'));

    if ((this.get('model').proposalStatus === '05' || this.get('model').proposalStatus === '06') && !this.get('model').programOfficerName) {
      const message = { status: 'info', dismissable: true, message: this.get('messageTexts.info_noPOInfo'), level: this.get('messageService').LEVEL_SCREEN };
      this.get('messageService').addMessage(message);
    }

    this.set('editingDeadline', false);

    // Re-add no due dates error message
    const deadlineDates = this.get('deadlineDates');
    const deadlineDate = this.get('deadlineDate');
    if (isEmpty(deadlineDates) && !deadlineDate && !this.get('isAcceptedAnytime')) {
      if (!this.get('messageService').containsMessage(this.get('messageTexts.no_available_due_dates'))) {
        const message = {
          status: 'error',
          dismissable: false,
          message: this.get('messageTexts.no_available_due_dates'),
          level: this.get('messageService').LEVEL_SCREEN,
          displayRoute: 'proposal.index'
        };
        this.get('messageService').addMessage(message);
      }
    }
  },

  requiredPFUSections: computed('permissions.permissions.[]', 'sectionLookup.sectionInfo', 'sections', function () {
    let sectionObject = {};
    if (this.get('sectionLookup.sectionInfo') != null) {
      sectionObject = this.get('sectionLookup.sectionInfo');
      const pageSections = this.get('sections');
      for (let i = 0; i < pageSections.length; i += 1) {
        if (sectionObject[pageSections[i].sectionKey] && pageSections[i].sectionTitle
          === sectionObject[pageSections[i].sectionKey].name) {
          // if (this.get('permissions').hasPermission(pageSections[i].permissionKey)) {
          set(pageSections[i], 'enableAccess', sectionObject[pageSections[i].sectionKey].enableAccess);
          set(pageSections[i], 'lastUpdateDate', sectionObject[pageSections[i].sectionKey].lastUpdateDate);
          set(pageSections[i], 'complianceStatus', sectionObject[pageSections[i].sectionKey].complianceStatus);
          const sectionCompliance = sectionObject[pageSections[i].sectionKey].sectionCompliance;
          set(pageSections[i], 'sectionCompliance', sectionCompliance);
          if (sectionCompliance && (pageSections[i].sectionTitle === 'Cover Sheet' || pageSections[i].sectionTitle === 'Budget(s)' || pageSections[i].sectionTitle === 'Proposal Update Justification') && sectionCompliance.formChecked === false) {
            set(pageSections[i], 'formChecked', false);
          }
          else {
            set(pageSections[i], 'formChecked', true);
          }
          if (sectionCompliance && sectionCompliance.noOfErrors === 0
            && sectionCompliance.noOfWarnings === 0 && sectionCompliance.noOfDocsUnavailable
            === 0 && pageSections[i].formChecked !== false) {
            set(pageSections[i], 'sectionIsCompliant', true);
          }
          else {
            set(pageSections[i], 'sectionIsCompliant', false);
          }
        }
      }
    }
    function checkRequired(section) {
      return section.requirement === 'requiredPFU' || section.requirement === 'conditionalPFU';
    }
    return this.get('sections').filter(checkRequired);
  }),

  requiredSections: computed('permissions.permissions.[]', 'sectionLookup.sectionInfo', 'sections', function () {
    let sectionObject = {};
    if (this.get('sectionLookup.sectionInfo') != null) {
      sectionObject = this.get('sectionLookup.sectionInfo');
      const pageSections = this.get('sections');
      for (let i = 0; i < pageSections.length; i += 1) {
        if (sectionObject[pageSections[i].sectionKey] && pageSections[i].sectionTitle
          === sectionObject[pageSections[i].sectionKey].name) {
          // if (this.get('permissions').hasPermission(pageSections[i].permissionKey)) {
          set(pageSections[i], 'enableAccess', sectionObject[pageSections[i].sectionKey].enableAccess);
          set(pageSections[i], 'lastUpdateDate', sectionObject[pageSections[i].sectionKey].lastUpdateDate);
          set(pageSections[i], 'complianceStatus', sectionObject[pageSections[i].sectionKey].complianceStatus);
          set(pageSections[i], 'sectionUpdated', sectionObject[pageSections[i].sectionKey].sectionUpdated);
          set(pageSections[i], 'indicatorType', sectionObject[pageSections[i].sectionKey].indicatorType);
          const sectionCompliance = sectionObject[pageSections[i].sectionKey].sectionCompliance;
          set(pageSections[i], 'sectionCompliance', sectionCompliance);
          if (sectionCompliance && (pageSections[i].sectionTitle === 'Cover Sheet' || pageSections[i].sectionTitle === 'Budget(s)' || pageSections[i].sectionTitle === 'Proposal Update Justification') && sectionCompliance.formChecked === false) {
            set(pageSections[i], 'formChecked', false);
          }
          else {
            set(pageSections[i], 'formChecked', true);
          }
          if (sectionCompliance && sectionCompliance.noOfErrors === 0
            && sectionCompliance.noOfWarnings === 0 && sectionCompliance.noOfDocsUnavailable
            === 0 && pageSections[i].formChecked !== false) {
            set(pageSections[i], 'sectionIsCompliant', true);
          }
          else {
            set(pageSections[i], 'sectionIsCompliant', false);
          }
        }
      }
    }
    function checkRequired(section) {
      return section.requirement === 'required' || section.requirement === 'conditional';
    }
    return this.get('sections').filter(checkRequired);
  }),

  optionalSections: computed('permissions.permissions.[]', 'sectionLookup.sectionInfo', 'sections', function () {
    let sectionObject = {};
    if (this.get('sectionLookup.sectionInfo') != null) {
      sectionObject = this.get('sectionLookup.sectionInfo');
      const pageSections = this.get('sections');
      for (let i = 0; i < pageSections.length; i += 1) {
        if (sectionObject[pageSections[i].sectionKey] && pageSections[i].sectionTitle
          === sectionObject[pageSections[i].sectionKey].name) {
          // if (this.get('permissions').hasPermission(pageSections[i].permissionKey)) {
          set(pageSections[i], 'enableAccess', sectionObject[pageSections[i].sectionKey].enableAccess);
          set(pageSections[i], 'lastUpdateDate', sectionObject[pageSections[i].sectionKey].lastUpdateDate);
          set(pageSections[i], 'complianceStatus', sectionObject[pageSections[i].sectionKey].complianceStatus);
          set(pageSections[i], 'sectionUpdated', sectionObject[pageSections[i].sectionKey].sectionUpdated);
          set(pageSections[i], 'indicatorType', sectionObject[pageSections[i].sectionKey].indicatorType);
          const sectionCompliance = sectionObject[pageSections[i].sectionKey].sectionCompliance;
          set(pageSections[i], 'sectionCompliance', sectionCompliance);
          if (sectionCompliance && (pageSections[i].sectionTitle === 'Cover Sheet' || pageSections[i].sectionTitle === 'Budget(s)' || pageSections[i].sectionTitle === 'Proposal Update Justification') && sectionCompliance.formChecked === false) {
            set(pageSections[i], 'formChecked', false);
          }
          else {
            set(pageSections[i], 'formChecked', true);
          }
          if (sectionCompliance && sectionCompliance.noOfErrors === 0
            && sectionCompliance.noOfWarnings === 0 && sectionCompliance.noOfDocsUnavailable
            === 0 && pageSections[i].formChecked !== false) {
            set(pageSections[i], 'sectionIsCompliant', true);
          }
          else {
            set(pageSections[i], 'sectionIsCompliant', false);
          }
        }
      }
    }
    function checkRequired(section) {
      return section.requirement === 'optional';
    }
    return this.get('sections').filter(checkRequired);
  }),

  proposalStatusModalTitle: computed('model.isSubmittedProposal', function() {
    if (this.get('model.isSubmittedProposal')) {
      return this.messageTexts.proposal_status_modal_title_submitted;
    }

    return this.messageTexts.proposal_status_modal_title;
  }),

  proposalStatusModalDescription: computed('model.isSubmittedProposal', function() {
    if (this.get('model.isSubmittedProposal')) {
      return this.messageTexts.proposal_status_modal_description_submitted;
    }

    return this.messageTexts.proposal_status_modal_description;
  }),

  transitionToProposalList() {
    const route = this.get('model.isSubmittedProposal') ? 'submitted' : 'inprogress';
    this.transitionToRoute('proposals', route);
  },

  actions: {

    initiateRevision() {
      const propPrepId = this.get('model').propPrepId;
      const propRevId = this.get('model').propRevId;
      const nsfPropId = this.get('model').nsfPropId;

      this.get('messageService').clearActionMessages();
      this.set('updateBudgetRevLoading', true);

      this.get('proposalService').initiateRevision({
        propPrepId,
        propRevId,
        nsfPropId
      }).then((data) => {
          // transition to proposal page now that a revision has been created
          if (data && data.sectionResponse && data.sectionResponse.propPrepId && data.sectionResponse.propRevId) {
            this.transitionToRoute('proposal', data.sectionResponse.propPrepId, data.sectionResponse.propRevId);
          }
          else {
            const message = {status: 'error', dismissable: false, message: this.get('messageTexts.fail_initiate_revision')};
            this.get('messageService').addMessage(message);
          }
        }, () => {
          const message = {status: 'error', dismissable: false, message: this.get('messageTexts.fail_initiate_revision')};
          this.get('messageService').addMessage(message);
        })
      .then(() => {
        run(() => {
          this.set('updateBudgetRevLoading', false);
        });
      });
    },

    returnToPI() {
      // if >=5 set to '10'
      let accessLevelToSave = '03';
      if (parseInt(this.get('model').proposalStatus, 10) >= 12) {
        accessLevelToSave = '15';
      }
      else if (parseInt(this.get('model').proposalStatus, 10) >= 7) {
        accessLevelToSave = '10';
      }

      this.get('messageService').clearActionMessages();
      const accessDataToSave = {
        'propPrepId': this.get('model.propPrepId'),
        'propRevId': this.get('model.propRevId'),
        'proposalStatus': accessLevelToSave
      };

      this.get('proposalService').saveProposalAccess(accessDataToSave).then((data) => {
          if (data.messages) {
            for (let i = 0; i < data.messages.length; i += 1) {
              if (data.messages[i].type === 'ERROR') {
                const message = { status: 'error', dismissable: false, message: this.get('messageTexts.fail_generic') };
                this.get('messageService').addMessage(message);
                return;
              }
            }
          }

          const message = {
            status: 'success',
            dismissable: true,
            message: this.get('messageTexts.success_generic').replace('${propPrepID}', this.get('model.propPrepId')),
            level: this.get('messageService').LEVEL_CROSS_SCREEN,
            displayRoute: 'proposals.index'
          };
          this.get('messageService').addMessage(message);

          this.transitionToProposalList();
        }, () => {
          const message = { status: 'error', dismissable: false, message: this.get('messageTexts.fail_generic') };
          this.get('messageService').addMessage(message);
      });
    },

    updateDeadline(deadline) {
      this.set('model.deadline', deadline);
    },

    cancelDeadlineEdit() {
      this.send('exitDeadlineEdit');
    },
    exitDeadlineEdit() {
      this.set('editingDeadline', false);
    },
    enterDeadlineEdit(event) {
      if (event.type !== 'click' && event.keyCode !== 13) {
        return false;
      }
      this.set('selectedDate', this.get('deadlineDate'));
      this.set('editingDeadline', true);
      this.get('messageService').clearActionMessages();
    },
    selectDeadlineDate(newDate) {
      this.set('selectedDate', newDate);
    },
    saveDeadline(saveDate) {
      // also do a set on the deadlineDate or the model
      this.set('editingDeadline', false);
      this.get('messageService').clearActionMessages();

      const selectedDate = (saveDate) || this.get('selectedDate');
      const showMessages = !(saveDate);

      const newDeadlineTypeCode = this.get('deadlineDates').findBy('deadlineDate', parseInt(selectedDate, 10)).deadlineTypeCode;
      const newDeadlineTypeDesc = this.get('deadlineDates').findBy('deadlineDate', parseInt(selectedDate, 10)).deadlineTypeDesc;

      const dataToSend = {
        'propPrepId': this.get('propPrepId'),
        'propRevId': this.get('propRevId'),
        'deadline': {
          'deadlineDate': parseInt(selectedDate, 10),
          'deadlineTypeCode': newDeadlineTypeCode
        }
      };

      this.get('proposalService').updateProposal(dataToSend).then(() => {
          if (showMessages) {
            const message = {status: 'success', dismissable: true, message: this.get('messageTexts.deadline_success_generic')};
            this.get('messageService').addMessage(message);
          }
          // TODO: HMMMMMMMM
          this.set('model.deadline.deadlineDate', parseInt(selectedDate, 10));
          this.set('model.deadline.deadlineTypeCode', newDeadlineTypeCode);
          this.set('model.deadline.deadlineTypeDesc', newDeadlineTypeDesc);

          const deadlineModel = {
            deadlineTypeDesc: newDeadlineTypeDesc,
            deadlineDate: parseInt(selectedDate, 10),
            deadlineTypeCode: newDeadlineTypeCode
          }
          this.send('updateDeadline', deadlineModel);

          this.send('exitDeadlineEdit');
        }, () => {
          if (showMessages) {
            const message = {status: 'error', dismissable: false, message: this.get('messageTexts.deadline_fail_generic')};
            this.get('messageService').addMessage(message);
        }
        this.send('exitDeadlineEdit');
      });
    },

    onEnter(event) {
      if (event.keyCode === 13) {
        $(event.target.getAttribute('data-target')).modal('show');
      }
    },

    onProposalTitleEditing(isEditing) {
      this.set('isEditingTitle', isEditing);
    },

    onProposalTitleSave(proposalTitle) {
      const dataToSend = {
        propPrepId: this.get('propPrepId'),
        propRevId: this.get('propRevId'),
        proposalTitle
      };

      this.get('proposalService').updateProposal(dataToSend).then((/* data*/) => {
          this.set('isEditingTitle', false);

          this.get('analytics').trackEvent('Edit button_ Proposal Forms page');
          this.set('proposalTitle', proposalTitle);
        },
        (/* err*/) => {
          this.set('contentTitleError', 'Error Saving');
      });


    },

    trackFundingLink() {
      this.get('analytics').trackEvent('View Funding link offsite_ Proposal Forms Page');
    },

    trackPrintProposal() {
      this.get('analytics').trackEvent('Print Proposal button left nav_Proposal Forms page');
    },

    trackPAPPGLink() {
      this.get('analytics').trackEvent('PAPPG link left nav_Proposal Forms page');
    }
  }
});
