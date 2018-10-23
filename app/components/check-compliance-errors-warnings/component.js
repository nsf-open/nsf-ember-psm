import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import { copy } from '@ember/object/internals';
import { htmlSafe } from '@ember/string';

export default Component.extend({
  activeUser: service('active-user'),
  proposalService: service('proposal'),
  props: service('properties'),

  didReceiveAttrs() {
    this._super(...arguments);
    const propPrepId = this.get('propPrepId'),
          propRevId = this.get('propRevId');
    // ajax call
    this.get('proposalService').getComplianceStatus({propPrepId, propRevId}).then((data) => {
        this.set('complianceMessages', data.validationMsgs.psmMessages);
        this.set('areComplianceMessagesSet', true);
      });
  },

  init(...args) {
    this._super(...args);

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
    ];
  },

  errorHeaderPFUBR: computed('isPFUStatus', function() {
    const isPFUStatus = this.get('isPFUStatus');
    if (isPFUStatus) {
      return htmlSafe('The following error(s) must be fixed prior to <b>submitting the proposal file update/budget revision.</b>')
    }
    else {
      return htmlSafe('The following error(s) must be fixed prior to <b>submitting the proposal.</b>')
    }
  }),

  warningHeaderPFUBR: computed('isPFUStatus', function() {
    const isPFUStatus = this.get('isPFUStatus');
    if (isPFUStatus) {
      return htmlSafe('The following warning(s) are recommended to be checked prior to <b>submitting the proposal file update/budget revision.</b>')
    }
    else {
      return htmlSafe('The following warning(s) are recommended to be checked prior to <b>submitting the proposal.</b>')
    }
  }),

  noErrorsWarnings: computed('hasComplianceErrors', 'hasComplianceWarnings', 'areComplianceMessagesSet', function() {
    let bool = false;
    if (!this.get('hasComplianceErrors') && !this.get('hasComplianceWarnings')) {
      bool = true;
    }
    if (this.get('setPassedComplianceCheck') && this.get('areComplianceMessagesSet')) {
      this.get('setPassedComplianceCheck')(bool);
    }
    return bool;
  }),

  hasComplianceErrors: computed('complianceMessages', function() {
    let bool = false;
    const status = this.get('complianceMessages');
    if (status) {
      for (let i = 0; i < status.length; i += 1) {
        if (status[i].type.toUpperCase() == 'ERROR') {
          bool = true;
        }
      }
    }
    if (this.get('areComplianceMessagesSet') && this.get('setHasComplianceErrors')) {
      this.get('setHasComplianceErrors')(bool);
    }

    return bool;
  }),
  hasComplianceWarnings: computed('complianceMessages', function() {
    let bool = false;
    const status = this.get('complianceMessages');
    if (status) {
      for (let i = 0; i < status.length; i += 1) {
        if (status[i].type.toUpperCase() == 'WARNING') {
          bool = true;
        }
      }
    }
    if (this.get('areComplianceMessagesSet') && this.get('setHasComplianceWarnings')) {
      this.get('setHasComplianceWarnings')(bool);
    }
    return bool;
  }),
  orderedComplianceStatusErrors: computed('complianceMessages', function() {
    const complianceErrorMessages = this.get('complianceMessages').filterBy('type', 'ERROR');

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
  orderedComplianceStatusWarnings: computed('complianceMessages', function() {
    const complianceWarningMessages = this.get('complianceMessages').filterBy('type', 'WARNING');

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

});
