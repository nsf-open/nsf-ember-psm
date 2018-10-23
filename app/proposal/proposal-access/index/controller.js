import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { inject as controller } from '@ember/controller';
import { alias } from '@ember/object/computed';
import { computed } from '@ember/object';
import { copy } from '@ember/object/internals';
import { htmlSafe } from '@ember/string';
import $ from 'jquery';

export default Controller.extend({
  activeUser: service('active-user'),
  messageService: service('messages'),
  permissions: service('permissions'),
  proposalService: service('proposal'),
  props: service('properties'),

  breadCrumbForTitle: 'Proposal Access for SPO/AOR',
  changeAccessController: controller('proposal.proposal-access.change-access'),

  init() {
    this._super(...arguments);
    this.orderedSections = [
      {section: 'General', sectionCode: '00', messages: []},
      {section: 'Cover Sheet', sectionCode: '01', messages: []},
      {section: 'Project Summary', sectionCode: '05', messages: []},
      {section: 'Project Description', sectionCode: '06', messages: []},
      {section: 'References Cited', sectionCode: '08', messages: []},
      {section: 'Data Management Plan', sectionCode: '12', messages: []},
      {section: 'Senior Personnel Documents', sectionCode: '23', messages: []},
      {section: 'Biographical Sketch', sectionCode: '02', messages: []},
      {section: 'Collaborators and Other Affiliations', sectionCode: '03', messages: []},
      {section: 'Current and Pending Support', sectionCode: '04', messages: []},
      {section: 'Facilities, Equipment and Other Resources', sectionCode: '11', messages: []},
      {section: 'Budget(s)', sectionCode: '09', messages: []},
      {section: 'Budget Justification(s)', sectionCode: '10', messages: []},
      {section: 'Other Personnel Biographical Information', sectionCode: '22', messages: []},
      {section: 'List of Suggested Reviewers', sectionCode: '19', messages: []},
      {section: 'List of Reviewers Not to Include', sectionCode: '20', messages: []},
      {section: 'Other Supplementary Documents', sectionCode: '24', messages: []}
    ]
  },

  accessLevel: alias('model.accessData.proposalPackage.proposalStatus'),

  spoAccessLevel: computed('accessLevel', function() {
    let accessText = 'No access';
    switch (this.get('accessLevel')) {
      case '00':
        accessText = 'No access';
        break;
      case '01':
        accessText = 'View only access';
        break;
      case '02':
        accessText = 'Edit access';
        break;
      case '03':
        accessText = 'No access';
        break;
      case '04':
        accessText = 'Edit access';
        break;
      case '05':
        accessText = 'No access';
        break;
      case '06':
        accessText = 'No access';
        break;
      case '07':
        accessText = 'No access';
        break;
      case '08':
        accessText = 'View only access';
        break;
      case '09':
        accessText = 'Edit access';
        break;
      case '10':
        accessText = 'No access';
        break;
      case '11':
        accessText = 'Edit access';
        break;
      case '12':
        accessText = 'No access';
        break;
      case '13':
        accessText = 'View only access';
        break;
      case '14':
        accessText = 'Edit access';
        break;
      case '15':
        accessText = 'No access';
        break;
      case '16':
        accessText = 'Edit access';
        break;
      default:
        accessText = 'Unavailable';
    }
    return accessText;
  }),
  aorAccessLevel: computed('accessLevel', function() {
    let accessText = 'No access';
    switch (this.get('accessLevel')) {
      case '00':
        accessText = 'No access';
        break;
      case '01':
        accessText = 'View only access';
        break;
      case '02':
        accessText = 'Edit access';
        break;
      case '03':
        accessText = 'No access';
        break;
      case '04':
        accessText = 'Edit access with submit';
        break;
      case '05':
        accessText = 'No access';
        break;
      case '06':
        accessText = 'No access';
        break;
      case '07':
        accessText = 'No access';
        break;
      case '08':
        accessText = 'View only access';
        break;
      case '09':
        accessText = 'Edit access';
        break;
      case '10':
        accessText = 'No access';
        break;
      case '11':
        accessText = 'Edit access with submit';
        break;
      case '12':
        accessText = 'No access';
        break;
      case '13':
        accessText = 'View only access';
        break;
      case '14':
        accessText = 'Edit access';
        break;
      case '15':
        accessText = 'No access';
        break;
      case '16':
        accessText = 'Edit access with submit';
        break;
      default:
        accessText = 'Unavailable';
    }
    return accessText;
  }),

  errorHeaderPFUBR: computed('model.isPFUStatus', function() {
    const isPFUStatus = this.get('model.isPFUStatus');
    if (isPFUStatus) {
      return htmlSafe('The following error(s) must be fixed prior to <b>submitting the proposal file update/budget revision.</b>')
    }
    else {
      return htmlSafe('The following error(s) must be fixed prior to <b>submitting the proposal.</b>')
    }
  }),

  warningHeaderPFUBR: computed('model.isPFUStatus', function() {
    const isPFUStatus = this.get('model.isPFUStatus');
    if (isPFUStatus) {
      return htmlSafe('The following warning(s) are recommended to be checked prior to <b>submitting the proposal file update/budget revision.</b>')
    }
    else {
      return htmlSafe('The following warning(s) are recommended to be checked prior to <b>submitting the proposal.</b>')
    }
  }),

  hasComplianceErrors: computed('model.complianceMessages', function() {
    const status = this.get('model.complianceMessages');
    for (let i = 0; i < status.length; i += 1) {
      if (status[i].type.toUpperCase() == 'ERROR') {
        return true;
      }
    }
    return false;
  }),
  hasComplianceWarnings: computed('model.complianceMessages', function() {
    const status = this.get('model.complianceMessages');
    for (let i = 0; i < status.length; i += 1) {
      if (status[i].type.toUpperCase() == 'WARNING') {
        return true;
      }
    }
    return false;
  }),

  orderedComplianceStatusErrors: computed('model.complianceMessages', function() {
    const complianceErrorMessages = this.get('model.complianceMessages').filterBy('type', 'ERROR');

    const orderedSections = copy(this.get('orderedSections'), true);
    for (let i = 0; i < orderedSections.length; i += 1) {
      const orderedSection = orderedSections[i];
      const orderedSectionCode = orderedSection.sectionCode;

      for (let j = 0; j < complianceErrorMessages.length; j += 1) {
        if (orderedSectionCode === complianceErrorMessages[j].sectionCode) {
          orderedSection.messages.push(complianceErrorMessages[j].description);
        }
      }
    }
    return orderedSections;
  }),
  orderedComplianceStatusWarnings: computed('model.complianceMessages', function() {
    const complianceWarningMessages = this.get('model.complianceMessages').filterBy('type', 'WARNING');

    const orderedSections = copy(this.get('orderedSections'), true);
    for (let i = 0; i < orderedSections.length; i += 1) {
      const orderedSection = orderedSections[i];
      const orderedSectionCode = orderedSection.sectionCode;

      for (let j = 0; j < complianceWarningMessages.length; j += 1) {
        if (orderedSectionCode === complianceWarningMessages[j].sectionCode) {
          orderedSection.messages.push(complianceWarningMessages[j].description);
        }
      }
    }
    return orderedSections;
  }),

  reInit() {
    this.send('refreshPermissions');

    const changeAccessSuccessMessage = this.get('changeAccessController').messageTexts.success_generic;

    if (!this.get('messageService').containsMessage(changeAccessSuccessMessage)) {
      const self = this;
      setTimeout(function() {
        self.send('toggleNotifications', '#collapseLink');
        $('#submissionNotifications').addClass('in');
      }, 500);
    }
  },

  actions: {
    refreshPermissions() {
      const propPrepId = this.get('propPrepId'),
            propRevId = this.get('propRevId');


      this.get('proposalService').getProposalPermissions({ propPrepId, propRevId }).then((data) => {
        if (data && data.userProfile) {
          if (data.userProfile.permissions) {
            this.get('permissions').resetPermissions(data.userProfile.permissions);
          }
          else {
            this.transitionTo('proposal-prep');
          }
          if (data.userProfile.role) {
            this.get('permissions').setRoles(data.userProfile.role);
          }
        }
        else {
          this.transitionTo('proposal-prep');
        }
      }, () => {
        this.transitionTo('proposal-prep');
      });
    },
    toggleNotifications(targetID) {
      if ($(targetID).find('i').hasClass('fa-angle-down')) {
        $(targetID).find('button span').text('Expand');
        $(targetID).find('i').toggleClass('fa-angle-down fa-angle-right');
      }
      else {
        $(targetID).find('button span').text('Collapse');
        $(targetID).find('i').toggleClass('fa-angle-down fa-angle-right');
      }
    },

  }

});
