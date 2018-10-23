import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import { alias } from '@ember/object/computed';
import { equal } from '@ember/object/computed';
import { empty } from '@ember/object/computed';
import { scheduleOnce } from '@ember/runloop';
import { later } from '@ember/runloop';
import { set } from '@ember/object';
import $ from 'jquery';
import { run } from '@ember/runloop';

const digitsPattern = /^[0-9]*$/;
const digitsExist = /\d/;

// let emailPattern = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;
const emailPattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

const nameAllowableCharactersPattern = /^([a-zA-Z,.\-'’\-ÀÁÂÃÄÅÇÈÉÊËÌÍÎÑÒÓÔÕÖØÙÚÛÜÝàáâãäåçèéêëìíîïñòóôõöøùúûüýÿÐÞßðþ ])*$/;


export default Controller.extend({

  props: service('properties'),
  permissions: service('permissions'),
  personnelService: service('personnel'),
  proposalService: service('proposal'),
  PROPOSAL_CONSTANTS: service('proposal-constants'),
  activeUser: service('active-user'),
  analytics: service('webtrend-analytics'),
  messageService: service('messages'),

  isSearching: false,

  modalMessages: computed(function() {
    return [];
  }),


  personnels: alias('model'),

  breadCrumb: 'Manage Personnel',

  searchCoPIbyID: '',
  searchCoPIbyEmail: '',
  searchOtherSeniorPersonnelbyID: '',
  searchOtherSeniorPersonnelbyEmail: '',
  searchOAUbyID: '',
  searchOAUbyEmail: '',
  personnelSearchResultsEmpty: false,
  searchType: 'registered',

  init(...args) {
    this._super(...args);

    const {
      ADD_PERSONNEL,
      REMOVE_SELECTED_PERSONNEL,
      RETRIEVE_PERSONNEL,
      SEARCH_PERSONNEL
    } = this.get('PROPOSAL_CONSTANTS').SYSTEM_ERROR;

    this.set('messageTexts', {
      'success_addCoPI': 'A co-Principal Investigator has been successfully added to the proposal and will now have the ability to make changes to any section. An email has been sent with instructions for accessing the proposal. All other personnel with access to the proposal will also be notified by email.',
      'success_addOtherSeniorPersonnel': 'An individual identified as other senior personnel has been successfully added to the proposal. This person will be listed on the proposal, but will not have any access.',
      'success_addOAU': 'An Other Authorized User has been successfully added to the proposal and will now have the ability to make changes to any section. An email has been sent with instructions for accessing the proposal. All other personnel with access to the proposal will also be notified by email.',
      'success_removePerson': '${removedUser} has been successfully removed from the proposal. This person, in addition to all personnel with access to the proposal, will be notified by email about this change.',
      'success_removeOSP': '${removedUser} has been successfully removed from the proposal.',
      'success_removePI': '${oldPI} has been successfully removed from the proposal, and ${newPI} has been assigned as the new Principal Investigator. Both people, in addition to all personnel with access to the proposal, will be notified by email about the changes.',
      'success_removePISelf': '${oldPI} has been successfully removed from proposal ${propPrepId}, and cannot access this proposal anymore. ${newPI} has been assigned as the new Principal Investigator, and will be notified by email. All other personnel with access to the proposal will also be notified by email.',
      'success_removeSelf': '${removedUser} has been successfully removed from proposal ${propPrepId}, and cannot access this proposal anymore. All personnel with access to the proposal will be notified by email.',
      'fail_getPersonnel': RETRIEVE_PERSONNEL,
      'fail_addPersonnel': ADD_PERSONNEL,
      'fail_removePerson': REMOVE_SELECTED_PERSONNEL,
      'fail_searchGeneric': SEARCH_PERSONNEL,
      'fail_nameDuplication': 'This personnel has already been added to the proposal',
      'warning_name_duplication': 'This personnel name is already associated with the proposal, and may be a duplicate. Please ensure any personnel added to your proposal are only listed once.',
      'info_removePI_PFU': 'In a Proposal File Update/Budget Revision, only co-Principal Investigators (co-PIs) from the same organization as the Principal Investigator (PI) are able to be assigned the PI role.',
      'tooltip_removePI': 'To assign a new Principal Investigator (PI), a co-PI from the same organization must be available'
    });
  },

  personnelNSFIDList: computed('personnel', function() {
    const persons = this.get('personnel');
    const nsfIDList = [];
    for (let i = 0; i < persons.length; i += 1) {
      if (persons[i].nsfId) {
        nsfIDList.push(persons[i].nsfId);
      }
    }
    return nsfIDList;
  }),

  colspanSeniorPersonnel: computed('permissions.permissions.[]', function() {
    const permissions = this.get('permissions');
    if (permissions.hasPermission('proposal.personnel.remove')) {
      return '4';
    }
    return '3';
  }),

  colspanOtherPersonnel: computed('permissions.permissions.[]', function() {
    const permissions = this.get('permissions');
    if (permissions.hasPermission('proposal.personnel.remove')) {
      return '3';
    }
    return '2';
  }),

  // inputNSFIDEnabled: computed('searchCoPIbyEmail','searchOtherSeniorPersonnelbyEmail','searchOAUbyEmail','searchCoPIbyID','searchOtherSeniorPersonnelbyID','searchOAUbyID', function() {
  //   $("input[type='text']").addClass('disabled');
  //   $(document.activeElement).removeClass('disabled');
  //   return true;
  // }),
  inputEmailDisabled: computed('searchCoPIbyID', 'searchOtherSeniorPersonnelbyID', 'searchOAUbyID', function() {
    if (this.get('searchCoPIbyID') || this.get('searchOtherSeniorPersonnelbyID') || this.get('searchOAUbyID')) {
      return true;
    }
    return false;
  }),
  inputNSFIDDisabled: computed('searchCoPIbyEmail', 'searchOtherSeniorPersonnelbyEmail', 'searchOAUbyEmail', function() {
    if (this.get('searchCoPIbyEmail') || this.get('searchOtherSeniorPersonnelbyEmail') || this.get('searchOAUbyEmail')) {
      return true;
    }
    return false;
  }),
  inputNSFIDDisabledText: computed('inputNSFIDDisabled', function() {
    if (this.get('inputNSFIDDisabled')) {
      return 'You must remove text from the Email field to enable the NSF ID field';
    }
    return '';
  }),
  inputEmailDisabledText: computed('inputEmailDisabled', function() {
    if (this.get('inputEmailDisabled')) {
      return 'You must remove text from the NSF ID field to enable the Email field';
    }
    return '';
  }),

  currentUser: computed('personnel.[]', function() {
    const personnel = this.get('personnel');
    if (!personnel || personnel.length === 0) {
      return null;
    }
    for (let i = 0; i < personnel.length; i += 1) {
      if (personnel[i].nsfId == this.get('activeUser').getNSFID()) {
        return personnel[i];
      }
    }
    return null;
  }),

  // PI properties
  currentPI: computed('personnel.[]', function() {
    const personnel = this.get('personnel');
    if (!personnel || personnel.length === 0) {
      return null;
    }
    for (let i = 0; i < personnel.length; i += 1) {
      if (personnel[i].displayRole == 'Principal Investigator') {
        return personnel[i];
      }
    }
    return null;
  }),

  // co-PI properties
  maxCoPIs: 4,
  addCoPIDisabled: computed('personnel.[]', function() {
    const personnel = this.get('personnel');
    if (!personnel || personnel.length == 0) {
      return 0;
    }
    let coPICount = 0;
    for (let i = 0; i < personnel.length; i += 1) {
      if (personnel[i].psmrole && personnel[i].psmrole.code == '02') {
        coPICount += 1;
      }
    }
    return coPICount >= this.get('maxCoPIs');
  }),
  addCoPIDisabledTitle: computed('addCoPIDisabled', function() {
    return this.get('addCoPIDisabled') ? 'Only 4 co-Principal Investigators are permitted in the proposal' : '';
  }),
  searchCoPIDisabled: true,
  searchCoPIDisabledTitle: computed('searchCoPIDisabled', function() {
    return this.get('searchCoPIDisabled') ? 'You must first enter either a valid 9 digit NSFID or email' : '';
  }),
  confirmCoPIDisabled: empty('personnelSearchResults.[]'),
  confirmCoPIDisabledTitle: computed('confirmCoPIDisabled', function() {
    return this.get('confirmCoPIDisabled') ? 'A co-Principal Investigator must be selected before they can be added' : '';
  }),
  coPIList: computed('personnel.[]', function() {
    const personnel = this.get('personnel');
    if (!personnel || personnel.length === 0) {
      return [];
    }
    const coPIs = [];
    for (let i = 0; i < personnel.length; i += 1) {
      if (personnel[i].psmrole && personnel[i].psmrole.code == '02') {
        coPIs.push(personnel[i]);
      }
    }
    return coPIs;
  }),
  coPIExists: computed('coPIList', function() {
    const coPIs = this.get('coPIList');
    if (!coPIs || coPIs.length === 0) {
      return false;
    }
    return true;
  }),
  newCoPISelection: 0,

  coPIsAvailableInPFU: computed('numCoPIsAvailableInPFU', function() {
    return this.get('numCoPIsAvailableInPFU') > 0;
  }),
  numCoPIsAvailableInPFU: computed('coPIExists', 'coPIList', 'currentPI', function() {
    if (!this.get('coPIExists')) {
      return 0;
    }
    const currentPI = this.get('currentPI').institution.id;
    const availableCoPIs = this.get('coPIList').filterBy('institution.id', currentPI);

    return availableCoPIs.length;
  }),

  // Other Senior Personnel properties
  searchOtherSeniorPersonnelDisabled: true,
  searchOtherSeniorPersonnelDisabledTitle: computed('searchOtherSeniorPersonnelDisabled', function() {
    return this.get('searchOtherSeniorPersonnelDisabled') ? 'You must first enter either a valid 9 digit NSFID or email' : '';
  }),
  confirmOtherSeniorPersonnelDisabled: computed('personnelSearchResults.[]', 'searchType', 'addOtherSeniorPersonnelbyFirstName', 'addOtherSeniorPersonnelbyLastName',
    'firstNameValidationError', 'middleInitialValidationError', 'lastNameValidationError', function() {
      if (this.get('searchType') === 'freeform') {
      // need to check freeform fields and validate to enable/disable this button
        if (this.get('firstNameValidationError') === 'error' || this.get('middleInitialValidationError') === 'error' || this.get('lastNameValidationError') === 'error') {
          return true;
        }
        else if (!this.get('addOtherSeniorPersonnelbyFirstName') || !this.get('addOtherSeniorPersonnelbyLastName')) {
          return true;
        }
        else if (this.get('addOtherSeniorPersonnelbyFirstName') && this.get('addOtherSeniorPersonnelbyLastName')) {
          return false;
        }
      }
      else if (this.get('personnelSearchResults') && this.get('personnelSearchResults').length > 0) {
        return false;
      }
      return true;
    }),
  confirmOtherSeniorPersonnelDisabledTitle: computed('confirmOtherSeniorPersonnelDisabled', function() {
    return this.get('confirmOtherSeniorPersonnelDisabled') ? 'Other Senior Personnel must be selected before they can be added' : '';
  }),
  addOtherSeniorPersonnelReady: false,

  // OAU properties
  searchOAUDisabled: true,
  searchOAUDisabledTitle: computed('searchOAUDisabled', function() {
    return this.get('searchOAUDisabled') ? 'You must first enter either a valid 9 digit NSFID or email' : '';
  }),
  confirmOAUDisabled: empty('personnelSearchResults.[]'),
  confirmOAUDisabledTitle: computed('confirmOAUDisabled', function() {
    return this.get('confirmOAUDisabled') ? 'Other Authorized User must be selected before they can be added' : '';
  }),
  noOAUs: computed('personnel', function() {
    if (!this.get('personnel')) {
      return true;
    }
    let noOAUFound = true;
    for (let i = 0; i < this.get('personnel').length; i += 1) {
      if (this.get('personnel')[i].psmrole && this.get('personnel')[i].psmrole.code == '04') {
        noOAUFound = false;
      }
    }
    return noOAUFound;
  }),

  emailValidationError: computed('searchCoPIbyEmail', 'searchOtherSeniorPersonnelbyEmail', 'searchOAUbyEmail', function() {
    let section = '';
    let content = '';
    if (this.get('searchCoPIbyEmail')) { section = 'coPI'; content = this.get('searchCoPIbyEmail'); }
    else if (this.get('searchOtherSeniorPersonnelbyEmail')) { section = 'otherSeniorPersonnel'; content = this.get('searchOtherSeniorPersonnelbyEmail'); }
    else if (this.get('searchOAUbyEmail')) { section = 'otherAuthorizedUser'; content = this.get('searchOAUbyEmail'); }

    if (!content) {
      return '';
    }

    content = content.trim();

    for (let i = 0; i < this.get('personnelSorted').length; i += 1) {
      if (section === 'coPI' && this.get('personnelSorted')[i].email === this.get('searchCoPIbyEmail')) {
        this.set('nsfIDValidationError', true);
        this.set('searchCoPIDisabled', true);
        return 'error';
      }
      if (section === 'otherSeniorPersonnel' && this.get('personnelSorted')[i].email === this.get('searchOtherSeniorPersonnelbyEmail')) {
        this.set('nsfIDValidationError', true);
        this.set('searchOtherSeniorPersonnelDisabled', true);
        return 'error';
      }
      if (section === 'otherAuthorizedUser' && this.get('personnelSorted')[i].email === this.get('searchOAUbyEmail')) {
        this.set('nsfIDValidationError', true);
        this.set('searchOAUDisabled', true);
        return 'error';
      }
    }

    if (!emailPattern.test(content)) {
      this.set('searchCoPIDisabled', true);
      this.set('searchOtherSeniorPersonnelDisabled', true);
      this.set('searchOAUDisabled', true);
      return 'error';
    }

    if (content) {
      this.set('searchCoPIDisabled', false);
      this.set('searchOtherSeniorPersonnelDisabled', false);
      this.set('searchOAUDisabled', false);
    }
  }),

  reInit() {
    this.send('getPersonnel');

    scheduleOnce('afterRender', this, function() {
      $('td:not(.allow-spaces) input').on({
        keydown (e) {
          if (e.which === 32) { return false; }
        }
      });
      $('input').bind('paste', function (e) {
        setTimeout(function () {
          e.target.value = e.target.value.trim().replace(new RegExp('’', 'g'), "'");
        }, 100);
      });
      $('.modal').on('shown.bs.modal', function() {
        $(this).find('[autofocus]').first().focus();
      });
    });
  },

  actions: {



    onEnter(event) {
      if (event.keyCode === 13) {
        $('#rolesInfoModal').modal('show');
      }
    },

    checkInputNSFIDEnabled() {
      $("input[type='text']").addClass('disabled');
      $(document.activeElement).removeClass('disabled');

      // @TODO: may need to re-validate the focused input so we can disable/enable Search
    },

    resetEmailValidationErrors() {
      this.set('personnelSearchResultsEmpty', false);
      this.set('nsfEmailValidationError', false);
    },

    runIdValidationErrors() {
      this.set('nsfIDNumberValidationError', false);
      this.set('nsfIDValidationError', false);
      this.set('nsfIDNumberOnlyValidationError', false);

      let section = '';
      let content = '';
      if (this.get('searchCoPIbyID')) { section = 'coPI'; content = this.get('searchCoPIbyID'); }
      else if (this.get('searchOtherSeniorPersonnelbyID')) { section = 'otherSeniorPersonnel'; content = this.get('searchOtherSeniorPersonnelbyID'); }
      else if (this.get('searchOAUbyID')) { section = 'otherAuthorizedUser'; content = this.get('searchOAUbyID'); }

      if (!content) {
        this.set('idValidationError', '');
      }

      content = content.trim();

      for (let i = 0; i < this.get('personnelSorted').length; i += 1) {
        if (section === 'coPI' && this.get('personnelSorted')[i].nsfId === this.get('searchCoPIbyID')) {
          this.set('nsfIDValidationError', true);
          this.set('searchCoPIDisabled', true);
          this.set('idValidationError', 'error');
          return;
        }
        if (section === 'otherSeniorPersonnel' && this.get('personnelSorted')[i].nsfId === this.get('searchOtherSeniorPersonnelbyID')) {
          this.set('nsfIDValidationError', true);
          this.set('searchOtherSeniorPersonnelDisabled', true);
          this.set('idValidationError', 'error');
          return;
        }
        if (section === 'otherAuthorizedUser' && this.get('personnelSorted')[i].nsfId === this.get('searchOAUbyID')) {
          this.set('nsfIDValidationError', true);
          this.set('searchOAUDisabled', true);
          this.set('idValidationError', 'error');
          return;
        }
      }

      if (content.length > 9) {
        this.set('nsfIDNumberValidationError', true);
        this.set('searchCoPIDisabled', true);
        this.set('searchOtherSeniorPersonnelDisabled', true);
        this.set('searchOAUDisabled', true);
        this.set('idValidationError', 'error');
        return;
      }
      // test for number only and show: nsfIDNumberOnlyValidationError
      if (!digitsPattern.test(content)) {
        this.set('nsfIDNumberOnlyValidationError', true);
        this.set('searchCoPIDisabled', true);
        this.set('searchOtherSeniorPersonnelDisabled', true);
        this.set('searchOAUDisabled', true);
        this.set('idValidationError', 'error');
        return;
      }

      // @TODO here if no error (which would be returned already) and if length==9 could enable button manually?
      if (content && content.length === 9) {
        this.set('searchCoPIDisabled', false);
        this.set('searchOtherSeniorPersonnelDisabled', false);
        this.set('searchOAUDisabled', false);
      }
      else {
        this.set('searchCoPIDisabled', true);
        this.set('searchOtherSeniorPersonnelDisabled', true);
        this.set('searchOAUDisabled', true);
      }

      this.set('idValidationError', '')
    },

    showEmailValidationError(emberObject, content) {

      if (content && !emailPattern.test(content)) {
        this.set('nsfEmailValidationError', true); // don't actually show this until blur
        this.set('searchCoPIDisabled', true);
        this.set('searchOtherSeniorPersonnelDisabled', true);
        this.set('searchOAUDisabled', true);
      }
      else if (content) {
        this.set('nsfEmailValidationError', false); // don't actually show this until blur
        this.set('searchCoPIDisabled', false);
        this.set('searchOtherSeniorPersonnelDisabled', false);
        this.set('searchOAUDisabled', false);
      }
    },

    firstNameUpdate() {
      // reset name duplication warning every time this name changes
      this.send('clearModalMessages');
      this.set('addOtherSeniorPersonnelReady', false);

      if (!this.get('addOtherSeniorPersonnelbyFirstName')) {
        this.set('firstNameLengthValidationError', false);
        this.set('firstNameNumberValidationError', false);
        this.set('firstNameCharacterValidationError', false);
        this.set('firstNameValidationError', '');
        return;
      }

      const content = this.get('addOtherSeniorPersonnelbyFirstName').trim();

      this.set('firstNameLengthValidationError', false);
      this.set('firstNameNumberValidationError', false);
      this.set('firstNameCharacterValidationError', false);

      if (content && content.length > 13) {
        this.set('firstNameLengthValidationError', true);
        this.set('firstNameValidationError', 'error');
        return;
      }
      if (digitsExist.test(content)) {
        this.set('firstNameNumberValidationError', true);
        this.set('firstNameValidationError', 'error');
        return;
      }
      else if (!nameAllowableCharactersPattern.test(content)) {
        this.set('firstNameCharacterValidationError', true);
        this.set('firstNameValidationError', 'error');
        return;
      }

      this.set('firstNameValidationError', '');

    },

    middleInitialUpdate() {
        // reset name duplication warning every time this name changes
        this.send('clearModalMessages');
        this.set('addOtherSeniorPersonnelReady', false);

        if (!this.get('addOtherSeniorPersonnelbyMiddleInitial')) {
          this.set('middleInitialLengthValidationError', false);
          this.set('middleInitialCharacterValidationError', false);
          this.set('middleInitialValidationError', '');
          return;
        }

        const content = this.get('addOtherSeniorPersonnelbyMiddleInitial').trim();

        this.set('middleInitialLengthValidationError', false);
        this.set('middleInitialCharacterValidationError', false);

        if (content && content.length > 1) {
          this.set('middleInitialLengthValidationError', true);
          this.set('middleInitialValidationError', 'error');
          return;
        }
        if (digitsExist.test(content)) {
          this.set('middleInitialLengthValidationError', true);
          this.set('middleInitialValidationError', 'error');
          return
        }
        else if (!nameAllowableCharactersPattern.test(content)) {
          this.set('middleInitialCharacterValidationError', true);
          this.set('middleInitialValidationError', 'error');
          return
        }

        this.set('middleInitialValidationError', '');
    },

    lastNameUpdate() {
        // reset name duplication warning every time this name changes
        this.send('clearModalMessages');
        this.set('addOtherSeniorPersonnelReady', false);

        if (!this.get('addOtherSeniorPersonnelbyLastName')) {
          this.set('lastNameLengthValidationError', false);
          this.set('lastNameNumberValidationError', false);
          this.set('lastNameCharacterValidationError', false);
          this.set('lastNameValidationError', '');
          return;
        }

        const content = this.get('addOtherSeniorPersonnelbyLastName').trim();

        this.set('lastNameLengthValidationError', false);
        this.set('lastNameNumberValidationError', false);
        this.set('lastNameCharacterValidationError', false);

        if (content && content.length > 21) {
          this.set('lastNameLengthValidationError', true);
          this.set('lastNameValidationError', 'error');
          return;
        }
        if (digitsExist.test(content)) {
          this.set('lastNameNumberValidationError', true);
          this.set('lastNameValidationError', 'error');
          return;
        }
        else if (!nameAllowableCharactersPattern.test(content)) {
          this.set('lastNameCharacterValidationError', true);
          this.set('lastNameValidationError', 'error');
          return;
        }

        this.set('lastNameValidationError', '');

    },

    refreshPermissions(oldNSFID, newNSFID) {
      if (this.get('activeUser').getNSFID() === oldNSFID) {
        this.get('activeUser').setNSFID(newNSFID);
      }

      this.get('proposalService').getProposalPermissions({ propPrepId: this.get('propPrepId'), propRevId: this.get('propRevId') })
        .then((data) => {
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

    getPersonnel() {
      const propPrepId = this.get('propPrepId');
      const propRevId = this.get('propRevId');
      this.set('personnelDataLoading', true);


      this.get('personnelService').getAllPersonnel({propPrepId, propRevId}).then((data) => {
        this.set('personnelDataLoading', false);
        const personnel = data.personnels;
        for (let i = 0; i < personnel.length; i += 1) {
          set(personnel[i], 'displayRole', this.lookup('seniorPersonRoleTypes', personnel[i].psmrole.code, 'code', 'description'));
          const displayName = `${personnel[i].firstName + (personnel[i].middleName ? (` ${personnel[i].middleName}`) : '')} ${personnel[i].lastName}`;
          set(personnel[i], 'displayName', displayName);
        }
        this.set('personnel', personnel);
      }, () => {
        this.set('personnelDataLoading', false);
        const message = {status: 'error', dismissable: true, message: this.get('messageTexts').fail_getPersonnel};
        this.get('messageService').addMessage(message);
        this.set('personnel', []);
      });
  },

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

      // Remove table stripes
      $('.table').each(function () {
        $('tr.primary-row').removeClass('row-odd');
        $('tr.secondary-row').removeClass('row-odd');
      });

      // Fade table stripes back in after re-sort
      later((function () {
        $('.table').each(function () {
          $('tr.primary-row:odd').addClass('row-odd');
          $('tr.secondary-row:odd').addClass('row-odd');
        });
      }), 10);
    },

    sortByOAU(sortByProperty) {
      // set sort properties which will trigger a re-sort
      if (this.get('currentSortOAU') === sortByProperty) {
        if (this.get('currentSortOrderOAU') === 'asc') {
          this.set('currentSortOrderOAU', 'desc');
        }
        else {
          this.set('currentSortOrderOAU', 'asc');
        }
      }
      else {
        this.set('currentSortOrderOAU', 'asc');
      }

      this.set('currentSortOAU', sortByProperty);

      // Remove table stripes
      $('.table').each(function () {
        $('tr.primary-row').removeClass('row-odd');
        $('tr.secondary-row').removeClass('row-odd');
      });

      // Fade table stripes back in after re-sort
      later((function () {
        $('.table').each(function () {
          $('tr.primary-row:odd').addClass('row-odd');
          $('tr.secondary-row:odd').addClass('row-odd');
        });
      }), 10);
    },

    addPersonnelModal(role) {
      this.get('messageService').clearActionMessages();
      this.set('personnelSearchResultsEmpty', false);
      this.send('clearModalMessages');
      if (role === 'copi') {
        this.get('analytics').trackEvent('Add co Principal Investigator button_Manage Personnel');
      }
      else if (role === 'osp') {
        this.get('analytics').trackEvent('Add Other Senior Personnel button_Manage Personnel');
      }
      else if (role === 'oau') {
        this.get('analytics').trackEvent('Add Other Authorized User button_Manage Personnel');
      }
    },
    searchPersonnel(role, inputID, inputEmail) {
      this.set('personnelSearchResultsEmpty', false);
      const roleCode = role;
      const nSFId = this.get(inputID);
      const email = this.get(inputEmail);

      this.set('personnelSearchDataLoading', true);
      this.set('personnelSearchResults', []);
      this.send('clearModalMessages');

      let searchPersonnelPromise;
      if (nSFId) {
        searchPersonnelPromise = this.get('personnelService').getPersonnelById({nSFId, roleCode});
      }
      else {
        searchPersonnelPromise = this.get('personnelService').getPersonnelByEmail({email, roleCode});
      }

      this.set('isSearching', true);
      searchPersonnelPromise.then((data) => {
          this.set('personnelSearchDataLoading', false);
          let dataToReturn = [];
          if (email) {
            for (let i = 0; i < data.personnels.length; i += 1) {
              if (data.personnels[i].nsfId && !this.get('personnelNSFIDList').contains(data.personnels[i].nsfId)) {
                dataToReturn.push(data.personnels[i]); // not a duplicate
              }
            }
          }
          else {
            dataToReturn = data.personnels;
          }
          this.set('personnelSearchResults', dataToReturn);
          if (dataToReturn.length) {
            $('#confirmAddCoPI').prop('disabled', false);
          }
          else {
            this.set('personnelSearchResultsEmpty', true);
          }
        }, () => {
          this.set('personnelSearchDataLoading', false);
          this.set('personnelSearchResults', []);
          const message = {status: 'error', dismissable: false, message: this.get('messageTexts.fail_searchGeneric')};
          this.send('addModalMessage', message);
        }).then(() => {
        run(() => {
          this.set('isSearching', false);
        });
      });
    },
    searchOtherSeniorPersonnel(inputID, inputEmail) {
      this.set('personnelSearchResultsEmpty', false);
      const nSFId = this.get(inputID);
      const email = this.get(inputEmail);
      this.set('personnelSearchDataLoading', true);
      this.set('personnelSearchResults', []);
      this.send('clearModalMessages');

      let searchOtherSeniorPersonnelPromise;
      if (nSFId) {
        searchOtherSeniorPersonnelPromise = this.get('personnelService').getOtherSeniorPersonnelByNSFId({nSFId});
      }
      else {
        searchOtherSeniorPersonnelPromise = this.get('personnelService').getOtherSeniorPersonnelByEmail({email});
      }

      this.set('isSearching', true);

      searchOtherSeniorPersonnelPromise.then((data) => {
          this.set('personnelSearchDataLoading', false);
          let dataToReturn = [];
          if (email) {
            for (let i = 0; i < data.personnels.length; i += 1) {
              if (data.personnels[i].nsfId && !this.get('personnelNSFIDList').contains(data.personnels[i].nsfId)) {
                dataToReturn.push(data.personnels[i]); // not a duplicate
              }
            }
          }
          else {
            dataToReturn = data.personnels;
          }
          this.set('personnelSearchResults', dataToReturn);
          if (dataToReturn.length) {
            $('#confirmAddOtherSeniorPersonnel').prop('disabled', false);
          }
          else {
            this.set('personnelSearchResultsEmpty', true);
          }
        }, () => {
          this.set('personnelSearchDataLoading', false);
          this.set('personnelSearchResults', []);
          const message = {status: 'error', dismissable: false, message: this.get('messageTexts.fail_searchGeneric')};
          this.send('addModalMessage', message);
        }).then(() => {
        run(() => {
          this.set('isSearching', false);
        });
      });
    },
    searchOtherAuthorizedUser(inputID, inputEmail) {
      this.set('personnelSearchResultsEmpty', false);
      const nSFId = this.get(inputID);
      const email = this.get(inputEmail);
      this.set('personnelSearchDataLoading', true);
      this.set('personnelSearchResults', []);
      this.send('clearModalMessages');

      let searchOtherSeniorPersonnelPromise;

      if (nSFId) {
        searchOtherSeniorPersonnelPromise = this.get('personnelService').getOtherSeniorPersonnelByNSFId({nSFId});
      }
      else {
        searchOtherSeniorPersonnelPromise = this.get('personnelService').getOtherSeniorPersonnelByEmail({email})
      }

      this.set('isSearching', true);

      searchOtherSeniorPersonnelPromise.then((data) => {
          this.set('personnelSearchDataLoading', false);
          let dataToReturn = [];
          if (email) {
            for (let i = 0; i < data.personnels.length; i += 1) {
              if (data.personnels[i].nsfId && !this.get('personnelNSFIDList').contains(data.personnels[i].nsfId)) {
                dataToReturn.push(data.personnels[i]); // not a duplicate
              }
            }
          }
          else {
            dataToReturn = data.personnels;
          }
          this.set('personnelSearchResults', dataToReturn);
          if (dataToReturn.length) {
            $('#confirmAddOAU').prop('disabled', false);
          }
          else {
            this.set('personnelSearchResultsEmpty', true);
          }
        }, () => {
          this.set('personnelSearchDataLoading', false);
          this.set('personnelSearchResults', []);
          const message = {status: 'error', dismissable: false, message: this.get('messageTexts.fail_searchGeneric')};
          this.send('addModalMessage', message);
        }).then(() => {
        run(() => {
          this.set('isSearching', false);
        });
      });
    },
    addCoPI() {
      const personnelToAdd = this.get('personnelSearchResults')[$('input[name=personnel-search-copi]:checked').val()];
      const personnelDataToSend = {
        'propRevnId': this.get('propRevId'),
        'propPrepId': this.get('propPrepId'),
        'nsfId': personnelToAdd.nsfId,
        'institution': {'id': personnelToAdd.institution.id},
        'firstName': personnelToAdd.firstName,
        'lastName': personnelToAdd.lastName,
        'psmrole': {'code': '02'}
      };
      if (personnelToAdd.middleName) {
        personnelDataToSend.middleName = personnelToAdd.middleName;
      }

      this.get('personnelService').savePersonnel(personnelDataToSend).then(() => {
          this.send('getPersonnel');
          const message = {status: 'success', dismissable: true, message: this.get('messageTexts').success_addCoPI};
          this.get('messageService').addMessage(message);
        }, () => {
          const message = {status: 'error', dismissable: true, displayType: 'noBullet', message: this.get('messageTexts').fail_addPersonnel};
          this.get('messageService').addMessage(message);
        });

      this.send('resetAddCoPI');
    },
    resetAddCoPI() {
      this.set('searchCoPIbyID', '');
      this.set('searchCoPIbyEmail', '');
      this.set('personnelSearchResults', []);
      this.set('nsfIDValidationError', false);
      this.set('nsfEmailValidationError', false);
      this.set('nsfIDNumberValidationError', false);
      this.set('nsfIDNumberOnlyValidationError', false);
      this.set('searchCoPIDisabled', true);
      this.set('searchOtherSeniorPersonnelDisabled', true);
      this.set('searchOAUDisabled', true);
      this.send('clearModalMessages');

      $('#confirmAddCoPI').prop('disabled', true);
    },

    // Other Senior Personnel actions
    addOtherSeniorPersonnel() {
      let personnelDataToSend = {};

      if (this.get('searchType') === 'registered') {
        const personnelToAdd = this.get('personnelSearchResults')[$('input[name=personnel-search-otherseniorpersonnel]:checked').val()];
        personnelDataToSend = {
          'propRevnId': this.get('propRevId'),
          'propPrepId': this.get('propPrepId'),
          'nsfId': personnelToAdd.nsfId,
          'institution': {'id': personnelToAdd.institution.id},
          'firstName': personnelToAdd.firstName,
          'lastName': personnelToAdd.lastName,
          'psmrole': {'code': '03'}
        };
        if (personnelToAdd.middleName) {
          personnelDataToSend.middleName = personnelToAdd.middleName;
        }
      }
      else if (this.get('searchType') === 'freeform') {
        // validate for name duplication against all other OSPs
        const srPersonnel = this.get('personnelSorted').concat(this.get('personnelSortedOAU'));
        for (let i = 0; i < srPersonnel.length; i += 1) {
          if (srPersonnel[i].firstName.toLowerCase() == this.get('addOtherSeniorPersonnelbyFirstName').toLowerCase()
          && srPersonnel[i].lastName.toLowerCase() == this.get('addOtherSeniorPersonnelbyLastName').toLowerCase()) {
            if (this.get('addOtherSeniorPersonnelbyMiddleInitial')) {
              if (!srPersonnel[i].middleName || srPersonnel[i].middleName.toLowerCase() == this.get('addOtherSeniorPersonnelbyMiddleInitial').toLowerCase()) {
                if (this.get('addOtherSeniorPersonnelReady') !== true) {
                  const message = {status: 'warning', dismissable: false, message: this.get('messageTexts.warning_name_duplication')};
                  this.send('addModalMessage', message);
                  this.set('addOtherSeniorPersonnelReady', true);
                  return;
                }
              }
            }
            else if (this.get('addOtherSeniorPersonnelReady') !== true) {
              const message = {status: 'warning', dismissable: false, message: this.get('messageTexts.warning_name_duplication')};
              this.send('addModalMessage', message);
              this.set('addOtherSeniorPersonnelReady', true);
              return;
            }
          }
        }

        personnelDataToSend = {
          'propRevnId': this.get('propRevId'),
          'propPrepId': this.get('propPrepId'),
          'firstName': this.get('addOtherSeniorPersonnelbyFirstName').trim(),
          'lastName': this.get('addOtherSeniorPersonnelbyLastName').trim(),
          'psmrole': {'code': '03'}
        };
        if (this.get('addOtherSeniorPersonnelbyMiddleInitial')) {
          personnelDataToSend.middleName = this.get('addOtherSeniorPersonnelbyMiddleInitial');
        }
      }
      else {
        return;
      }

      this.get('personnelService').savePersonnel(personnelDataToSend).then(() => {
          this.send('getPersonnel');
          const message = {status: 'success', dismissable: true, message: this.get('messageTexts').success_addOtherSeniorPersonnel};
          this.get('messageService').addMessage(message);
        }, () => {
          const message = {status: 'error', dismissable: true, displayType: 'noBullet', message: this.get('messageTexts').fail_addPersonnel};
          this.get('messageService').addMessage(message);
        });

      this.send('resetAddOtherSeniorPersonnel');
      $('#addOtherSeniorPersonnelModal').modal('hide');
    },
    resetAddOtherSeniorPersonnel() {
      this.set('searchOtherSeniorPersonnelbyID', '');
      this.set('searchOtherSeniorPersonnelbyEmail', '');
      this.set('personnelSearchResults', []);
      this.set('searchType', 'registered');
      this.set('nsfIDValidationError', false);
      this.set('nsfEmailValidationError', false);
      this.set('nsfIDNumberValidationError', false);
      this.set('nsfIDNumberOnlyValidationError', false);
      this.set('searchCoPIDisabled', true);
      this.set('searchOtherSeniorPersonnelDisabled', true);
      this.set('searchOAUDisabled', true);
      this.send('clearModalMessages');

      this.send('updateSearchSelect');

      this.set('addOtherSeniorPersonnelbyFirstName', '');
      this.set('addOtherSeniorPersonnelbyMiddleInitial', '');
      this.set('addOtherSeniorPersonnelbyLastName', '');
      this.set('addOtherSeniorPersonnelReady', false);

      $('#confirmAddOtherSeniorPersonnel').prop('disabled', true);
    },

    // OAU actions
    addOAU() {
      const personnelToAdd = this.get('personnelSearchResults')[$('input[name=personnel-search-oau]:checked').val()];
      const personnelDataToSend = {
        'propRevnId': this.get('propRevId'),
        'propPrepId': this.get('propPrepId'),
        'nsfId': personnelToAdd.nsfId,
        'institution': {'id': personnelToAdd.institution.id},
        'firstName': personnelToAdd.firstName,
        'lastName': personnelToAdd.lastName,
        'psmrole': {'code': '04'}
      };
      if (personnelToAdd.middleName) {
        personnelDataToSend.middleName = personnelToAdd.middleName;
      }

      this.get('personnelService').savePersonnel(personnelDataToSend).then(() => {
          this.send('getPersonnel');
          const message = {status: 'success', dismissable: true, message: this.get('messageTexts').success_addOAU};
          this.get('messageService').addMessage(message);
        }, () => {
          const message = {status: 'error', dismissable: true, displayType: 'noBullet', message: this.get('messageTexts').fail_addPersonnel};
          this.get('messageService').addMessage(message);
        });

      this.send('resetAddOAU');
    },
    resetAddOAU() {
      this.set('searchOAUbyID', '');
      this.set('searchOAUbyEmail', '');
      this.set('personnelSearchResults', []);
      this.set('nsfIDValidationError', false);
      this.set('nsfEmailValidationError', false);
      this.set('nsfIDNumberValidationError', false);
      this.set('nsfIDNumberOnlyValidationError', false);
      this.set('searchCoPIDisabled', true);
      this.set('searchOtherSeniorPersonnelDisabled', true);
      this.set('searchOAUDisabled', true);
      this.send('clearModalMessages');

      $('#confirmAddOAU').prop('disabled', true);
    },

    trimWhiteSpace(inputComputedProperty) {
      const inputValueTrimmed = this.get(inputComputedProperty).trim();
      this.set(inputComputedProperty, inputValueTrimmed);
    },

    /**
     * Change PI Modal Actions
     */
    // changePI() {
    //   this.send('clearMessages');
    // },
    enableConfirmChangePI() {
      $('#confirmChangePI').prop('disabled', false);
    },
    resetChangePI() {
      $('#confirmChangePI').prop('disabled', true);
      $('#changePIModal input').prop('checked', false);
    },

    /**
     * Change Role Modal Actions
     * @param personnel - change role for this person
     */
    // changeRole(personnel) {
    //   this.get('messageService').clearActionMessages();
    //   const self = this;
    //   $('#changeRoleModal').on('show.bs.modal', function () {
    //     self.set('modalChangeRole', personnel);
    //   });
    // },
    enableConfirmChangeRole() {
      $('#confirmChangeRole').prop('disabled', false);
    },
    resetChangeRole() {
      $('#confirmChangeRole').prop('disabled', true);
      $('#changeRoleModal input').prop('checked', false);
    },
    updateSearchSelect() {
      setTimeout(function() {
        $('td:not(.allow-spaces) input').on({
          keydown (e) {
            if (e.which === 32) { return false; }
          }
        });
        $('input').bind('paste', function (e) {
          setTimeout(function () {
            e.target.value = e.target.value.trim().replace(new RegExp('’', 'g'), "'");
          }, 100);
        });
      }, 200);
    },

    /**
     * Remove from Proposal Modal Actions
     * @param personnel - the person to be removed
     */
    removePI(personnel) {
      this.get('messageService').clearActionMessages();
      const self = this;
      $('#removePIModal').on('show.bs.modal', function () {
        self.set('modalRemovePI', personnel);

        if (self.get('model.isInPFUStatus') && self.get('numCoPIsAvailableInPFU') === 1) {
          const currentPI = self.get('currentPI').institution.id;
          const singleAvailableCoPI = self.get('coPIList').findBy('institution.id', currentPI);
          self.set('newCoPISelection', self.get('coPIList').indexOf(singleAvailableCoPI));
        }
      });
    },
    onEnterRemovePerson(event) {
      if (event.keyCode !== 13) return false;
      const element = event.target;
      const isOAU = element.hasAttribute('data-is-oau');
      const personnelArr = isOAU ? this.get('personnelSortedOAUFiltered') : this.get('personnelSortedFiltered');
      const personIndex = element.getAttribute('data-person-index');
      const person = personnelArr[personIndex];
      const callbackName = element.getAttribute('data-onenter-action');
      this.actions[callbackName].call(this, person);
      const modalSelector = element.getAttribute('data-target');
      $(modalSelector).modal('show');
    },
    confirmRemovePI() {
      const propPrepId = this.get('propPrepId');
      const propRevId = this.get('propRevId');

      const pIPersonnelId = this.get('currentPI').propPersId;
      const piNSFID = this.get('currentPI').nsfId;
      const piName = this.get('currentPI').displayName;

      const selectedCoPIIndex = this.get('newCoPISelection');
      const selectedCoPI = this.get('coPIList')[selectedCoPIIndex];
      const coPIPersonnelId = selectedCoPI.propPersId;
      const coPIName = selectedCoPI.displayName;

      const permissions = this.get('permissions');
      const isPI = !!permissions.hasRole('PI');
      const isNewPI = (selectedCoPI.nsfId === this.get('activeUser').getNSFID());

      this.set('newCoPISelection', 0);

      this.get('personnelService').replacePI({ propPrepId, propRevId, pIPersonnelId,
        newPIPersonnelId: coPIPersonnelId }).then(() => {
          this.send('getPersonnel');
          // If current user is PI, need to kick them out of proposal
          if (isPI) {
            const messageText = this.get('messageTexts').success_removePISelf.replace('${oldPI}', piName).replace('${newPI}', coPIName).replace('${propPrepId}', propPrepId);
            const message = {status: 'success', dismissable: true, message: messageText, level: this.get('messageService').LEVEL_CROSS_SCREEN, displayRoute: 'proposal-prep'};
            this.get('messageService').addMessage(message);
            this.transitionToRoute('proposal-prep');
            return;
          }
          if (isNewPI) {
            this.send('refreshPermissions', piNSFID, coPIPersonnelId);
          }
          const message = {status: 'success', dismissable: true, message: this.get('messageTexts').success_removePI.replace('${oldPI}', piName).replace('${newPI}', coPIName)};
          this.get('messageService').addMessage(message);
        }, () => {
          const message = {status: 'error', dismissable: true, message: this.get('messageTexts').fail_removePerson};
          this.get('messageService').addMessage(message);
        });
    },
    resetRemovePI() {
      this.set('newCoPISelection', 0);
    },
    removePerson(personnel) {
      this.get('messageService').clearActionMessages();
      const self = this;
      $('#removePersonModal').on('show.bs.modal', function () {
        self.set('modalRemovePerson', personnel);
        self.set('modalRemovePersonSelf', (personnel.nsfId === self.get('activeUser').getNSFID()));
      });
    },
    onEnterRemoveNonPI(event) {
      const callback = this.actions.removePerson.bind(this);
      return this.onEnterRemovePerson(event, callback);
    },
    confirmRemovePerson() {
      const propPrepId = this.get('propPrepId');
      const propRevId = this.get('propRevId');
      const personnelId = this.get('modalRemovePerson').propPersId;
      const removedUser = this.get('modalRemovePerson').displayName;
      const removedRole = this.get('modalRemovePerson').psmrole.code;
      const removedSelf = (this.get('modalRemovePerson').nsfId == this.get('activeUser').getNSFID());


      this.get('personnelService').removePersonnel({ propPrepId, propRevId, personnelId }).then(() => {
          this.send('getPersonnel');
          if (removedSelf) {
            const messageText = this.get('messageTexts').success_removeSelf.replace('${removedUser}', removedUser).replace('${propPrepId}', propPrepId);
            const message = {status: 'success', dismissable: true, message: messageText, level: this.get('messageService').LEVEL_CROSS_SCREEN, displayRoute: 'proposal-prep'};
            this.get('messageService').addMessage(message)
            this.transitionToRoute('proposal-prep');
            return;
          }
          let message = {};
          if (removedRole == '03') {
            message = {status: 'success', dismissable: true, message: this.get('messageTexts').success_removeOSP.replace('${removedUser}', removedUser)};
          }
          else {
            message = {status: 'success', dismissable: true, message: this.get('messageTexts').success_removePerson.replace('${removedUser}', removedUser)};
          }
          this.get('messageService').addMessage(message);
        }, () => {
          const message = {status: 'error', dismissable: true, message: this.get('messageTexts').fail_removePerson};
          this.get('messageService').addMessage(message);
        });
    },
    addModalMessage(message) {
      this.get('modalMessages').pushObject(message);
    },
    clearModalMessages() {
      this.set('modalMessages', []);
    }

  },

  lookup(lookupType, lookupMatch, lookupKey, lookupValue) {
    if (lookupType == 'seniorPersonRoleTypes' && this.get('lookupSrPerson') && this.get('lookupSrPerson').value) {
      const lookupObj = this.get('lookupSrPerson').value.seniorPersonRoleTypeLookUps;
      for (let i = 0; i < lookupObj.length; i += 1) {
        if (lookupObj[i][lookupKey] == lookupMatch) {
          return lookupObj[i][lookupValue];
        }
      }
    }
    else if (lookupType == 'otherPersonRoleTypes' && this.get('lookupOtherPerson') && this.get('lookupOtherPerson').value) {
      const lookupObj = this.get('lookupOtherPerson').value.otherPersonnelRoleTypeLookUps;
      for (let i = 0; i < lookupObj.length; i += 1) {
        if (lookupObj[i][lookupKey] == lookupMatch) {
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
  isSortByPermissions: equal('currentSort', 'permissions'),
  isSortDesc: equal('currentSortOrder', 'desc'),
  isSortAsc: equal('currentSortOrder', 'asc'),

  personnelSorted: computed('personnel', 'currentSort', 'currentSortOrder', function() {
    if (!this.get('personnel') || this.get('personnel') == []) {
      return [];
    }

    if (this.get('currentSort') == 'name') {
      if (this.get('currentSortOrder') == 'desc') {
        return this.personnel.sort(function(a, b) {
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
      else {
        return this.personnel.sort(function(a, b) {
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
    }
    else if (this.get('currentSort') == 'role') {
      if (this.get('currentSortOrder') == 'desc') {
        return this.personnel.sort(function(a, b) {
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
      else {
        return this.personnel.sort(function(a, b) {
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
    }
    else if (this.get('currentSort') == 'organization') {
      if (this.get('currentSortOrder') == 'desc') {
        return this.personnel.sort(function(a, b) {
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
      else {
        return this.personnel.sort(function(a, b) {
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
    }
  }),
  personnelSortedFiltered: computed('personnelSorted', function() {
    return this.get('personnelSorted').filter((person) => {
      const isValidCode = ['01', '02', '03'].indexOf(person.psmrole.code) !== -1;
      return isValidCode;
    });
  }),
  currentSortOAU: 'name',
  currentSortOrderOAU: 'asc',

  isSortByNameOAU: computed('currentSortOAU', function() {
    return (this.get('currentSortOAU') === 'name');
  }),
  isSortByRoleOAU: computed('currentSortOAU', function() {
    return (this.get('currentSortOAU') === 'role');
  }),
  isSortByOrganizationOAU: computed('currentSortOAU', function() {
    return (this.get('currentSortOAU') === 'organization');
  }),
  isSortDescOAU: computed('currentSortOrderOAU', function() {
    return (this.get('currentSortOrderOAU') === 'desc');
  }),
  isSortAscOAU: computed('currentSortOrderOAU', function() {
    return (this.get('currentSortOrderOAU') === 'asc');
  }),
  personnelSortedOAU: computed('personnel', 'currentSortOAU', 'currentSortOrderOAU', function() {
    if (!this.get('personnel') || this.get('personnel') == []) {
      return [];
    }

    if (this.get('currentSortOAU') == 'name') {
      if (this.get('currentSortOrderOAU') == 'desc') {
        return this.personnel.sort(function(a, b) {
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
      else {
        return this.personnel.sort(function(a, b) {
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
    }
    else if (this.get('currentSortOAU') == 'organization') {
      if (this.get('currentSortOrderOAU') == 'asc') {
        return this.personnel.sort(function(a, b) {
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
      else {
        return this.personnel.sort(function(a, b) {
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
    }
  }),

  personnelSortedOAUFiltered: computed('personnelSortedOAU', function() {
    const isValidCode = this.get('personnelSortedOAU').filter(person => person.psmrole.code === '04');
    return isValidCode;
  })

});
