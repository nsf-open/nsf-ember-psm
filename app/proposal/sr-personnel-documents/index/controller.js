import $ from 'jquery';
import { computed } from '@ember/object';
import Controller from '@ember/controller';
import { equal } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import { later } from '@ember/runloop';
import { set } from '@ember/object';
import { run } from '@ember/runloop';

import { getFullNameByPerson } from '../util';
import { IndicatorType } from '../../../components/indicator-label';

function getSortIndex(code) {
  const sortArr = ['02', '04', '03'];
  return sortArr.indexOf(code) + 1;
}

export default Controller.extend({
  props: service('properties'),
  activeUser: service('active-user'),
  session: service('session'),
  permissions: service('permissions'),
  analytics: service('webtrend-analytics'),
  PROPOSAL_CONSTANTS: service('proposal-constants'),

  breadCrumbForTitle: 'Senior Personnel Documents',

  init(...args) {
    this._super(...args);

    this.set('messageTexts', {
      'fail_timeout': 'The budget save timed out.',
      'fail_generic': this.get('PROPOSAL_CONSTANTS').SYSTEM_ERROR.SAVE_BUDGET,
      'single_copy_title': 'Single-copy document',
      'single_copy_info': 'Reviewers do not see single-copy documents. They are for NSF use only.'
    });

    this.set('personnelDataLoading', true);

    this.viewOnlyMessage = [
      { status: 'info', dismissable: false, message: 'You currently have view only access to the proposal. This access level is controlled by the PI/co-PIs on the proposal.' }
    ],

    this.toggleHash = {} // This is the toggle hash where the expand and collapse state is saved for each person

  },

  personnel: computed('model', function () {
    this.restripeTable();
    const hash = this.get('model');
    if(hash === null) return;

    let personnel;

    if (hash.personnel && hash.personnel.state === 'fulfilled') {
      personnel = hash.personnel.value.personnels;
      for (let i = 0; i < personnel.length; i += 1) { // should use only Senior Personnel
        if (personnel[i].psmrole.code !== '01' && personnel[i].psmrole.code !== '02' && personnel[i].psmrole.code !== '03') {
          personnel.splice(i, 1);
          i -= 1;
        }
        else {
          set(personnel[i], 'displayRole', this.lookup('seniorPersonRoleTypes', personnel[i].psmrole.code, 'code', 'description'));
          set(personnel[i], 'documentStatus', []);
          const displayName = getFullNameByPerson(personnel[i]);
          set(personnel[i], 'displayName', displayName);

          // parse through last updated dates and insert into personnel object
          let bioSketchFound = false;
          let coaFound = false;
          let currentSupportFound = false;
          personnel[i].hasWarnings = false;
          personnel[i].hasErrors = false;

          if (hash.lastUpdated && hash.lastUpdated.state === 'fulfilled') {
            const lastUpdatedData = hash.lastUpdated.value.personnels;
            for (let j = 0; j < lastUpdatedData.length; j += 1) {
              if (lastUpdatedData[j].pers && lastUpdatedData[j].pers.propPersId
                  === personnel[i].propPersId) {
                const sectionCompliance = lastUpdatedData[j].status.sectionCompliance;
                let isCompliant = false;
                if (sectionCompliance && sectionCompliance.noOfErrors === 0
                  && sectionCompliance.noOfWarnings === 0
                  && sectionCompliance.noOfDocsUnavailable === 0
                  && !sectionCompliance.formNotChecked) {
                  isCompliant = true;
                }
                personnel[i].documentStatus.push({
                  name: lastUpdatedData[j].status.name,
                  status: lastUpdatedData[j].status.complianceStatus,
                  lastUpdated: lastUpdatedData[j].status.lastUpdateDate,
                  compliance: lastUpdatedData[j].status.complianceStatus,
                  sectionCompliance: lastUpdatedData[j].status.sectionCompliance,
                  isCompliant,
                  sectionUpdated: lastUpdatedData[j].status.sectionUpdated,
                  indicatorType: IndicatorType.UpdatesSaved,
                  sortIndex: getSortIndex(lastUpdatedData[j].status.code)
                });
                if (lastUpdatedData[j].status.sectionCompliance.noOfWarnings > 0) {
                  personnel[i].hasWarnings = true;
                }
                if (lastUpdatedData[j].status.sectionCompliance.noOfErrors > 0) {
                  personnel[i].hasErrors = true;
                }
                if (lastUpdatedData[j].status.name === 'Biographical Sketch') {
                  bioSketchFound = true;
                }
                else if (lastUpdatedData[j].status.name === 'Current and Pending Support') {
                  coaFound = true;
                }
                else if (lastUpdatedData[j].status.name === 'Collaborators and Other Affiliations') {
                  currentSupportFound = true;
                }
              }
            }

            if (!bioSketchFound) {
              personnel[i].documentStatus.push({ name: 'Biographical Sketch', status: 'Not Started', lastUpdated: '', compliance: 'Not Checked' });
            }
            if (!coaFound) {
              personnel[i].documentStatus.push({ name: 'Current and Pending Support', status: 'Not Started', lastUpdated: '', compliance: 'Not Checked' });
            }
            if (!currentSupportFound) {
              personnel[i].documentStatus.push({ name: 'Collaborators and Other Affiliations', status: 'Not Started', lastUpdated: '', compliance: 'Not Checked' });
            }

            // now sort personnel[i].documentStatus
            personnel[i].documentStatus.sort(
              (a, b) => a.sortIndex - b.sortIndex
            );
          }
        }
      }
    }

    this.restripeTable();
    return personnel;
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
          $('tr.secondary-row:odd').addClass('row-odd');
        });
      });
    }), 10);
  },

  restripeRow(index, isExpanded) {
    if ((index % 2) !== 0) { // only restripe the row if odd
      later((() => { // allow expand/collapse to happen first
        $('.table').each(() => {
          run(() => {
            $('.table tr.primary-row:eq('+index+')').addClass('row-odd');
            if (isExpanded) {
              $('.table tr.primary-row:eq('+index+')').next().addClass('row-odd');
            }
          });
        });
      }), 10);
    }
  },

  actions: {

    sortBy(sortByProperty) {
      // set sort properties which will trigger a re-sort
      if (this.get('currentSort') === sortByProperty) {
        if (this.get('currentSortOrder') === 'asc') {
          this.set('currentSortOrder', 'desc');
        }
        else {
          this.set('currentSortOrder', 'asc');
        }
      }
      else {
        this.set('currentSortOrder', 'asc');
      }

      this.set('currentSort', sortByProperty);

      this.restripeTable();
    },

    editDocument(document) {
      const self = this;
      $('#editDocumentModal').on('show.bs.modal', () => {
        run(() => {
          self.set('modalEditDocument', document);
        });
      });
    },
    enableConfirmEditDocument() {

    },
    resetDocumentModal() {
      $('#inputDocument').val('');
    },
    browseForDocument() {

    },

    toggleChevron(index) {
      const toggledPersonnel = this.get('srDocumentPersonnel')[index];
      this.setToggle(toggledPersonnel, !toggledPersonnel.toggleOpen);
      this.restripeRow(index, toggledPersonnel.toggleOpen); // expand/collapse 1 'odd' row THEN restripe that row including subrow
    },
    expandAll() {
      this.setAllToggle(true);
    },


    collapseAll() {
      this.setAllToggle(false);
    },

    gotoManagePersonnel() {
      this.transitionToRoute('proposal.manage-personnel');
      this.get('analytics').trackEvent('Manage Personnel button_Senior Personnel Documents page');
    }

  },

  setToggle(personnel, value) {
    set(personnel, 'toggleOpen', value);
    this.toggleHash[personnel.propPersId] = value;
  },

  setAllToggle(value) {
    this.get('srDocumentPersonnel').forEach((personnel) => {
      this.setToggle(personnel, value);
    });
    this.restripeTable(); // expand/collapse all rows THEN restripe table
  },

  lookup(lookupType, lookupMatch, lookupKey, lookupValue) {
    if (lookupType === 'seniorPersonRoleTypes') {
      const lookupObj = this.get('model.documents.lookupSrPerson').value.seniorPersonRoleTypeLookUps;
      for (let i = 0; i < lookupObj.length; i += 1) {
        if (lookupObj[i][lookupKey] === lookupMatch) {
          return lookupObj[i][lookupValue];
        }
      }
    }
    else if (lookupType === 'otherPersonRoleTypes') {
      const lookupObj = this.get('model.documents.lookupOtherPerson').value.otherPersonnelRoleTypeLookUps;
      for (let i = 0; i < lookupObj.length; i += 1) {
        if (lookupObj[i][lookupKey] === lookupMatch) {
          return lookupObj[i][lookupValue];
        }
      }
    }
    return '';
  },

  currentSort: 'role',
  currentSortOrder: 'asc',

  isSortByName: equal('currentSort', 'name'),
  isSortByRole: equal('currentSort', 'role'),
  isSortByOrganization: equal('currentSort', 'organization'),
  isSortDesc: equal('currentSortOrder', 'desc'),
  isSortAsc: equal('currentSortOrder', 'asc'),

  srDocumentPersonnel: computed('personnelSorted', function () {
    if (!this.get('personnelSorted')) return;

    const toggleHash = this.get('toggleHash');
    const toggleHashEmpty = Object.keys(toggleHash).length === 0;
    const personnelArr = this.get('personnelSorted');

    if (toggleHashEmpty && personnelArr.length > 0) {
      const firstPersonnel = personnelArr[0];
      toggleHash[firstPersonnel.propPersId] = true;
    }

    return this.get('personnelSorted').map((personnel) => {
      const toggleValue = toggleHash[personnel.propPersId] || false;
      set(personnel, 'toggleOpen', toggleValue);
      return personnel;
    });
  }),

  personnelSorted: computed('personnel', 'currentSort', 'currentSortOrder', function () {
    if (!this.get('personnel') || this.get('personnel') === []) {
      return [];
    }

    if (this.get('currentSort') === 'name') {
      if (this.get('currentSortOrder') === 'desc') {
        return this.get('personnel').sort((a, b) => {
          // get first names, account for null
          const afirstname = (a.firstName === null) ? '' : `${a.firstName.toLowerCase()}`;
          const bfirstname = (b.firstName === null) ? '' : `${b.firstName.toLowerCase()}`;

          // get last names
          const valastname = (a.lastName === null) ? '' : `${a.lastName.toLowerCase()}`;
          const vblastname = (b.lastName === null) ? '' : `${b.lastName.toLowerCase()}`;

          // if last names equal, use first name
          if (valastname === vblastname) {
            // return afirstname < bfirstname ? 1 : (afirstname === bfirstname ? 0 : -1);
            if (afirstname < bfirstname) { return 1; }
            else if (afirstname === bfirstname) { return 0; }
            else { return -1; }
          }

          // if last names not equal, then use last name
          // return valastname < vblastname ? 1 : (valastname === vblastname ? 0 : -1);
          if (valastname < vblastname) { return 1; }
          else if (valastname === vblastname) { return 0; }
          else { return -1; }
        });
      }

      return this.get('personnel').sort((a, b) => {
        // Default Name Sort ------------------------------------------------------------
        // get first names, account for null
        const afirstname = (a.firstName === null) ? '' : `${a.firstName.toLowerCase()}`;
        const bfirstname = (b.firstName === null) ? '' : `${b.firstName.toLowerCase()}`;

        // get last names
        const valastname = (a.lastName === null) ? '' : `${a.lastName.toLowerCase()}`;
        const vblastname = (b.lastName === null) ? '' : `${b.lastName.toLowerCase()}`;

        // if last names equal, use first name
        if (valastname === vblastname) {
          // return afirstname > bfirstname ? 1 : (afirstname === bfirstname ? 0 : -1);
          if (afirstname > bfirstname) { return 1; }
          else if (afirstname === bfirstname) { return 0; }
          else { return -1; }
        }

        // if last names not equal, use last name
        // return valastname > vblastname ? 1 : (valastname === vblastname ? 0 : -1);
        if (valastname > vblastname) { return 1; }
        else if (valastname === vblastname) { return 0; }
        else { return -1; }
        //-------------------------------------------------------------------------------
      });
    }
    else if (this.get('currentSort') === 'role') {
      if (this.get('currentSortOrder') === 'desc') {
        return this.get('personnel').sort((a, b) => {
          const va = (a.psmrole.code === null) ? '' : `${a.psmrole.code}`;
          const vb = (b.psmrole.code === null) ? '' : `${b.psmrole.code}`;

          if (va === vb) {
            // Default Name Sort ------------------------------------------------------------
            // get first names, account for null
            const afirstname = (a.firstName === null) ? '' : `${a.firstName.toLowerCase()}`;
            const bfirstname = (b.firstName === null) ? '' : `${b.firstName.toLowerCase()}`;

            // get last names
            const valastname = (a.lastName === null) ? '' : `${a.lastName.toLowerCase()}`;
            const vblastname = (b.lastName === null) ? '' : `${b.lastName.toLowerCase()}`;

            // if last names equal, use first name
            if (valastname === vblastname) {
              // return afirstname > bfirstname ? 1 : (afirstname === bfirstname ? 0 : -1);
              if (afirstname > bfirstname) { return 1; }
              else if (afirstname === bfirstname) { return 0; }
              else { return -1; }
            }

            // if last names not equal, use last name
            // return valastname > vblastname ? 1 : (valastname === vblastname ? 0 : -1);
            if (valastname > vblastname) { return 1; }
            else if (valastname === vblastname) { return 0; }
            else { return -1; }
            //-------------------------------------------------------------------------------
          }

          // return va < vb ? 1 : (va === vb ? 0 : -1);
          if (va < vb) { return 1; }
          else if (va === vb) { return 0; }
          else { return -1; }
        });
      }

      return this.get('personnel').sort((a, b) => {
        const va = (a.psmrole.code === null) ? '' : `${a.psmrole.code}`;
        const vb = (b.psmrole.code === null) ? '' : `${b.psmrole.code}`;

        if (va === vb) {
          // Default Name Sort ------------------------------------------------------------
          // get first names, account for null
          const afirstname = (a.firstName === null) ? '' : `${a.firstName.toLowerCase()}`;
          const bfirstname = (b.firstName === null) ? '' : `${b.firstName.toLowerCase()}`;

          // get last names
          const valastname = (a.lastName === null) ? '' : `${a.lastName.toLowerCase()}`;
          const vblastname = (b.lastName === null) ? '' : `${b.lastName.toLowerCase()}`;

          // if last names equal, use first name
          if (valastname === vblastname) {
            // return afirstname > bfirstname ? 1 : (afirstname === bfirstname ? 0 : -1);
            if (afirstname > bfirstname) { return 1; }
            else if (afirstname === bfirstname) { return 0; }
            else { return -1; }
          }

          // if last names not equal, use last name
          // return valastname > vblastname ? 1 : (valastname === vblastname ? 0 : -1);
          if (valastname > vblastname) { return 1; }
          else if (valastname === vblastname) { return 0; }
          else { return -1; }
          //-------------------------------------------------------------------------------
        }

        // return va > vb ? 1 : (va === vb ? 0 : -1);
        if (va > vb) { return 1; }
        else if (va === vb) { return 0; }
        else { return -1; }
      });
    }
    else if (this.get('currentSort') === 'organization') {
      if (this.get('currentSortOrder') === 'desc') {
        return this.get('personnel').sort((a, b) => {
          const va = (a.institution.organizationName === null) ? '' : `${a.institution.organizationName}`;
          const vb = (b.institution.organizationName === null) ? '' : `${b.institution.organizationName}`;

          if (va === vb) {
            // Default Name Sort ------------------------------------------------------------
            // get first names, account for null
            const afirstname = (a.firstName === null) ? '' : `${a.firstName.toLowerCase()}`;
            const bfirstname = (b.firstName === null) ? '' : `${b.firstName.toLowerCase()}`;

            // get last names
            const valastname = (a.lastName === null) ? '' : `${a.lastName.toLowerCase()}`;
            const vblastname = (b.lastName === null) ? '' : `${b.lastName.toLowerCase()}`;

            // if last names equal, use first name
            if (valastname === vblastname) {
              // return afirstname > bfirstname ? 1 : (afirstname === bfirstname ? 0 : -1);
              if (afirstname > bfirstname) { return 1; }
              else if (afirstname === bfirstname) { return 0; }
              else { return -1; }
            }

            // if last names not equal, use last name
            // return valastname > vblastname ? 1 : (valastname === vblastname ? 0 : -1);
            if (valastname > vblastname) { return 1; }
            else if (valastname === vblastname) { return 0; }
            else { return -1; }
            //-------------------------------------------------------------------------------
          }

          // return va < vb ? 1 : (va === vb ? 0 : -1);
          if (va < vb) { return 1; }
          else if (va === vb) { return 0; }
          else { return -1; }
        });
      }

      return this.get('personnel').sort((a, b) => {
        const va = (a.institution.organizationName === null) ? '' : `${a.institution.organizationName}`;
        const vb = (b.institution.organizationName === null) ? '' : `${b.institution.organizationName}`;

        if (va === vb) {
          // Default Name Sort ------------------------------------------------------------
          // get first names, account for null
          const afirstname = (a.firstName === null) ? '' : `${a.firstName.toLowerCase()}`;
          const bfirstname = (b.firstName === null) ? '' : `${b.firstName.toLowerCase()}`;

          // get last names
          const valastname = (a.lastName === null) ? '' : `${a.lastName.toLowerCase()}`;
          const vblastname = (b.lastName === null) ? '' : `${b.lastName.toLowerCase()}`;

          // if last names equal, use first name
          if (valastname === vblastname) {
            // return afirstname > bfirstname ? 1 : (afirstname === bfirstname ? 0 : -1);
            if (afirstname > bfirstname) { return 1; }
            else if (afirstname === bfirstname) { return 0; }
            else { return -1; }
          }

          // if last names not equal, use last name
          // return valastname > vblastname ? 1 : (valastname === vblastname ? 0 : -1);
          if (valastname > vblastname) { return 1; }
          else if (valastname === vblastname) { return 0; }
          else { return -1; }
          //-------------------------------------------------------------------------------
        }

        // return va > vb ? 1 : (va === vb ? 0 : -1);
        if (va > vb) { return 1; }
        else if (va === vb) { return 0; }
        else { return -1; }
      });
    }
  })
});
