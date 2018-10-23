import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import { htmlSafe } from '@ember/string';
import { alias } from '@ember/object/computed';
import { isEmpty } from '@ember/utils';
import { isBlank } from '@ember/utils';
import { set } from '@ember/object';
import $ from 'jquery';
import { run } from '@ember/runloop';

const textAllowableCharactersPattern = /^([a-zA-Z\d!#&(),./:;\-%@$+<=>_ ])*$/;
const proposalDurationPattern = /^\d*$/;

const usPostalCode = /^\d{5}-(?!0{4})\d{4}$/;
const usPostalCodeEndsInZeros = /^\d{5}-0{4}$/;
const monthDayYearTyping = /^((0{0,1}[1-9]{0,1}|1[0-2]{0,1}){1})((\/{1}([1-9]{1}|0[1-9]{0,1}|[12]{1}\d{1}|3{1}[01]{0,1}){0,1})(\/{1}\d{0,4}){0,1}){0,1}$/;
const monthDayYearFocusOut = /^((0{0,1}[1-9]|1[0-2]{0,1}))\/(0{0,1}[1-9]|[12]\d|3[01])\/\d{4}$/;
const dateInputFormat = 'MM/DD/YYYY';

function sortCountries(countries) {
  return countries.sortBy('countryName');
}

export default Controller.extend({

  breadCrumb: 'Cover Sheet',

  props: service('properties'),
  activeUser: service('active-user'),
  messageService: service('messages'),
  coverSheetService: service('proposal/cover-sheet'),
  customForm: service(),
  analytics: service('webtrend-analytics'),
  PROPOSAL_CONSTANTS: service('proposal-constants'),

  isFormSubmission: true,
  isSaving: false,

  init(...args) {
    this._super(...args);

    this.set('messageTexts', {
      'fail_timeout': 'The save timed out.',
      'fail_generic': this.get('PROPOSAL_CONSTANTS').SYSTEM_ERROR.COVER_SHEET,
      'pp_missing_required_field': 'The following required field(s) are missing for place of performance: ',
      'invalid_data': 'The following field(s) have invalid data: ',
      'awardee_org_change_success': 'The Awardee Organization and Place of Performance have been successfully changed.',
      'success_cover_sheet_save': 'The cover sheet has been successfully saved.',
      'fail_coversheet_reload': 'The cover sheet failed to reload.'
    });

    this.text = {
      v_animals: {
        has_been_approved: 'Has the animal-use protocol covering the proposed work received  Institutional Animal Care and Use Committee (IACUC) approval?'
      },
      usps_link_text: 'ZIP Code+4 Lookup (USPS)'
    },

    this.disabledDate = [moment()]

  },

  permissions: service('permissions'),
  viewOnly: computed('permissions.permissions.[]', function () {
    return !this.get('permissions').hasPermission('proposal.data.modify');
  }),

  proposalService: service('proposal'),

  showAdditionalInfoMessage: computed('coverSheet.{historicPlace,humanSubject,intlActivities}', function () {
    let message = 'One or more of your selections may require you to provide additional information in the Other Supplementary Documents section of this proposal. The information may be required prior to an award being made. Please refer to the PAPPG for specific instructions.';
    if (this.get('coverSheet.historicPlace') || this.get('coverSheet.humanSubject') || this.get('coverSheet.intlActivities')) {
      message += '<ul style="list-style-type: disc">';
      if (this.get('coverSheet.historicPlace')) {
        message += '<li>Historic Places</li>';
      }
      if (this.get('coverSheet.humanSubject')) {
        message += '<li>Human Subjects</li>';
      }
      if (this.get('coverSheet.intlActivities')) {
        message += '<li>International Activities</li>';
      }
      message += '</ul>';
    }


    return { status: 'info', dismissable: true, message: htmlSafe(message) };
  }),

  internationalActivitiesName: 'International Activities',
  humanSubjectsName: 'Human Subjects',
  vertebrateAnimalsName: 'Vertebrate Animals',
  historicPlacesName: 'Historic Places',
  propPrivInfoName: 'Proprietary or Privileged Information',
  lobbyingActivitiesName: 'Disclosure of Lobbying Activities',
  beginningInvestigatorName: 'Beginning Investigator',
  notYetAvailableText: 'Not yet available. If needed, FastLane must be used.',

  minRequestedStartDate: moment().add(1, 'd'),
  today: moment(),

  coverSheet: alias('model.coverSheet'),

  sortedStates: computed('states', function () {
    return this.get('states').sortBy('stateName');
  }),

  sortedCountries: computed('countries', function () {
    return sortCountries(this.get('countries'));
  }),

  sortedInternationalCountries: computed('internationalCountries', function () {
    return sortCountries(this.get('internationalCountries'));
  }),

  awardeeOrg: alias('model.coverSheet.awdOrganization'),

  ppop: computed('coverSheet', function () {
    return this.get('coverSheet').ppop ? this.get('coverSheet').ppop : {};
  }),

  federalAgencies: computed('coverSheet', function () {
    return (this.get('coverSheet').federalAgencies && !isEmpty(this.get('coverSheet').federalAgencies)) ? this.get('coverSheet').federalAgencies : [{
      fedAgencyNameAbbreviation: ''
    }];
  }),

  internationalActyCountries: computed('coverSheet', function () {
    return (this.get('coverSheet').internationalActyCountries && !isEmpty(this.get('coverSheet').internationalActyCountries)) ? this.get('coverSheet').internationalActyCountries : [{
      intlCountryCode: '',
      intlCountryName: ''
    }];
  }),
  internationalActyCountriesDisabled: computed('coverSheet.intlActivities', 'internationalActyCountries', 'internationalActyCountries.[]', function() {
    const countries = this.get('internationalActyCountries');
    if (countries[countries.length - 1].intlCountryName === '') {
      return true;
    }
    return false;
  }),
  internationalActyCountriesDisabledText: computed('internationalActyCountriesDisabled', function() {
    if (this.get('internationalActyCountriesDisabled')) {
      return 'You must select a country above before you can add another.'
    }
    return '';
  }),
  internationalActyCountriesDisabledClass: computed('internationalActyCountriesDisabled', function() {
    if (this.get('internationalActyCountriesDisabled')) {
      return 'disabled';
    }
    return '';
  }),

  coverSheetModified: false,

  allAwardeeOrgs: alias('model.institutions'),

  selectNewAwardeeOrgOptions: computed('allAwardeeOrgs', 'awardeeOrg', function () {
    if (undefined !== this.get('allAwardeeOrgs')) {
      const options = this.get('allAwardeeOrgs').rejectBy('id', this.get('awardeeOrg').id);
      if (options.length == 1) {
        this.send('selectNewAwardeeOrg', options[0].id);
      }
      return options;
    }
    return [];
  }),
  changeAwardeeOrgButtonIsDisabled: computed('selectedNewAwardeeOrg', function () {
    if (this.get('selectedNewAwardeeOrg')) {
      return false;
    }
    return true;
  }),

  displayNavigationConfirm(transitionTarget) {
    this.set('exitCoverSheetTransition', transitionTarget);
    const modal = $("div .modal[id*='-unsavedExitConfirmationModal']")[0]; // this unsaved modal is imported first
    $(modal).modal();
  },

  afterModelLoad() {
    const ppop = this.get('ppop');
    if (ppop.organizationName) {
      this.send('trimInput', 'ppop.organizationName', 'Organization Name', 64, ppop.organizationName);
    }
    if (ppop.streetAddress) {
      this.send('trimInput', 'ppop.streetAddress', 'Street address', 80, ppop.streetAddress);
    }
    if (ppop.streetAddress2) {
      this.send('trimInput', 'ppop.streetAddress2', 'Street Address (Line 2)', 80, ppop.streetAddress2);
    }
    if (ppop.departmentName) {
      this.send('trimInput', 'ppop.departmentName', 'Department Name', 64, ppop.departmentName);
    }
    if (ppop.cityName) {
      this.send('trimInput', 'ppop.cityName', 'City', 26, ppop.cityName);
    }
    if (ppop.postalCode) {
      this.send('postalCodeFocusOut', ppop.postalCode);
    }

    if (ppop.countryCode) {
      this.send('selectCountry', ppop.countryCode);
    }

    const coverSheet = this.get('coverSheet');
    if (!coverSheet.requestedStartDate) {
      this.send('dateEmpty', '', 'requestedStartDate', 'Requested Start Date');
    }
    this.send('setJqueryCalendarBinding', 'requestedStartDate');

    if (coverSheet.vertebrateAnimal && coverSheet.vrtbAnimalAPType === 'approved' && !coverSheet.iAcucSAppDate) {
      this.send('dateEmpty', '', 'iAcucSAppDate', 'IACUC Approval Date');
      this.send('setJqueryCalendarBinding', 'iAcucSAppDate');
    }
    if (coverSheet.humanSubject) {
      if (coverSheet.humanSubjectsAPEType === 'approved' && !coverSheet.iRbAppDate) {
        this.send('dateEmpty', '', 'iRbAppDate', 'IRB Approval Date');
        this.send('setJqueryCalendarBinding', 'iRbAppDate');
      }
      else if (coverSheet.humanSubjectsAPEType === 'exempt' && !isEmpty(coverSheet.exemptionSubsection)) {
        this.send('trimInput', 'coverSheet.exemptionSubsection', 'Exemption Number', 11, coverSheet.exemptionSubsection);
      }
    }

    this.set('isCoverSheetModified', false); // textChecks set modified true, so reset as this is a load
  },
  validate() {
    this.get('messageService').clearActionMessages();
    const hasValidationErrors = true;

    const ppop = this.get('ppop');

    const organizationNameError = ppop.organizationNameError,
      streetAddressError = ppop.streetAddressError,
      streetAddress2Error = ppop.streetAddress2Error,
      departmentNameError = ppop.departmentNameError,
      cityNameError = ppop.cityNameError,
      postalCodeError = ppop.postalCodeError;

    const coverSheet = this.get('coverSheet');
    const requestedStartDateError = coverSheet.requestedStartDateError ? coverSheet.requestedStartDateError : null,
      proposalDurationError = coverSheet.proposalDurationError ? coverSheet.proposalDurationError : null,
      iAcucSAppDateError = coverSheet.iAcucSAppDateError ? coverSheet.iAcucSAppDateError : null,
      animalWelfareAssuNumberError = coverSheet.animalWelfareAssuNumberError ? coverSheet.animalWelfareAssuNumberError : null,
      iRbAppDateError = coverSheet.iRbAppDateError ? coverSheet.iRbAppDateError : null,
      humanSubjectAssuNumberError = coverSheet.humanSubjectAssuNumberError ? coverSheet.humanSubjectAssuNumberError : null,
      exemptionSubsectionError = coverSheet.exemptionSubsectionError ? coverSheet.exemptionSubsectionError : null;

    const fedAgValidationErrors = this.get('federalAgencies').filterBy('fedAgencyError');
    const intlCountryValidationErrors = this.get('internationalActyCountries').filterBy('intlCountryError');

    let invalidDataMessageText = this.get('messageTexts').invalid_data;
    const initialLength = invalidDataMessageText.length;

    if (!isBlank(requestedStartDateError)) {
      invalidDataMessageText += 'Requested Start Date';
    }
    if (!isBlank(proposalDurationError)) {
      if (invalidDataMessageText.length > initialLength) {
        invalidDataMessageText += ', ';
      }
      invalidDataMessageText += 'Proposal Duration';
    }
    if (!isBlank(organizationNameError)) {
      if (invalidDataMessageText.length > initialLength) {
        invalidDataMessageText += ', ';
      }
      invalidDataMessageText += 'Organization Name';
    }
    if (!isBlank(streetAddressError)) {
      if (invalidDataMessageText.length > initialLength) {
        invalidDataMessageText += ', ';
      }
      invalidDataMessageText += 'Street Address';
    }
    if (!isBlank(streetAddress2Error)) {
      if (invalidDataMessageText.length > initialLength) {
        invalidDataMessageText += ', ';
      }
      invalidDataMessageText += 'Street Address (Line 2)';
    }
    if (!isBlank(departmentNameError)) {
      if (invalidDataMessageText.length > initialLength) {
        invalidDataMessageText += ', ';
      }
      invalidDataMessageText += 'Department Name';
    }
    if (!isBlank(cityNameError)) {
      if (invalidDataMessageText.length > initialLength) {
        invalidDataMessageText += ', ';
      }
      invalidDataMessageText += 'City';
    }
    if (!isBlank(postalCodeError)) {
      if (invalidDataMessageText.length > initialLength) {
        invalidDataMessageText += ', ';
      }
      invalidDataMessageText += 'Postal Code';
    }
    if (fedAgValidationErrors.length > 0) {
      if (invalidDataMessageText.length > initialLength) {
        invalidDataMessageText += ', ';
      }
      invalidDataMessageText += 'Federal Agencies';
    }
    if (!isBlank(iAcucSAppDateError)) {
      if (invalidDataMessageText.length > initialLength) {
        invalidDataMessageText += ', ';
      }
      invalidDataMessageText += 'IACUC Approval Date';
    }
    if (!isBlank(animalWelfareAssuNumberError)) {
      if (invalidDataMessageText.length > initialLength) {
        invalidDataMessageText += ', ';
      }
      invalidDataMessageText += 'PHS Animal Welfare Assurance Number';
    }
    if (!isBlank(iRbAppDateError)) {
      if (invalidDataMessageText.length > initialLength) {
        invalidDataMessageText += ', ';
      }
      invalidDataMessageText += 'IRB Approval Date';
    }
    if (!isBlank(humanSubjectAssuNumberError)) {
      if (invalidDataMessageText.length > initialLength) {
        invalidDataMessageText += ', ';
      }
      invalidDataMessageText += 'Federal Wide Assurance (FWA) Number';
    }
    if (!isBlank(exemptionSubsectionError)) {
      if (invalidDataMessageText.length > initialLength) {
        invalidDataMessageText += ', ';
      }
      invalidDataMessageText += 'Exemption Number';
    }
    if (intlCountryValidationErrors.length > 0) {
      if (invalidDataMessageText.length > initialLength) {
        invalidDataMessageText += ', ';
      }
      invalidDataMessageText += this.get('internationalActivitiesName');
    }

    if (invalidDataMessageText.length > initialLength) {
      const message = { status: 'error', dismissable: false, message: invalidDataMessageText };
      return { 'hasValidationErrors': hasValidationErrors, 'message': message };
    }
    return { 'hasValidationErrors': !hasValidationErrors, 'message': '' };
  },

  actions: {
    postalCodeClick: () => {
      const uspsUrl = encodeURIComponent('https://tools.usps.com/go/ZipLookupAction_input');
      window.open(`/proposalprep/assets/redirect/external-redirect.html?redirect_uri=${uspsUrl}`, '_blank');
    },

    save() {
      this.set('isFormSubmission', true);
      this.get('analytics').trackEvent('Save button_Cover Sheet page');
      const hasValidationErrors = this.validate();


      if (hasValidationErrors.hasValidationErrors) {
        this.get('messageService').addMessage(hasValidationErrors.message);
      }

      if (!hasValidationErrors.hasValidationErrors) {
        for (let i = 0; i < this.get('federalAgencies').length; i += 1) {
          const fedAg = this.get('federalAgencies')[i];
          if (isEmpty(fedAg.fedAgencyNameAbbreviation)) {
            this.get('federalAgencies').removeObject(fedAg);
            i -= 1;
          }
        }
        if (this.get('federalAgencies').length === 0) {
          this.set('coverSheet.federalAgencies', []);
          this.set('federalAgencies', [{ fedAgencyNameAbbreviation: '' }]);
        }
        else {
          this.set('coverSheet.federalAgencies', this.get('federalAgencies'));
        }

        if (this.get('internationalActyCountries').length === 1 && isEmpty(this.get('internationalActyCountries')[0].intlCountryCode)) {
          this.set('coverSheet.internationalActyCountries', []);
        }
        else {
          this.set('coverSheet.internationalActyCountries', this.get('internationalActyCountries'));
        }

        if (!isEmpty(this.get('coverSheet.requestedStartDate'))) {
          this.set('coverSheet.requestedStartDate', moment(this.get('coverSheet.requestedStartDate')).unix() * 1000);
        }
        if (!isEmpty(this.get('coverSheet.iAcucSAppDate'))) {
          this.set('coverSheet.iAcucSAppDate', moment(this.get('coverSheet.iAcucSAppDate')).unix() * 1000);
        }
        if (!isEmpty(this.get('coverSheet.iRbAppDate'))) {
          this.set('coverSheet.iRbAppDate', moment(this.get('coverSheet.iRbAppDate')).unix() * 1000);
        }

        this.set('isSaving', true);
        this.get('coverSheetService').updateCoverSheet({coverSheet: this.get('coverSheet')})
          .then((data) => {
            this.set('isCoverSheetModified', false);
            const messages = data.sectionResponse.messages;

            if (messages) {
              for (let i = 0; i < messages.length; i += 1) {
                if (messages[i].type == 'ERROR') {
                  const message = {
                    status: 'error',
                    dismissable: false,
                    message: messages[i].description
                  };
                  this.get('messageService').addMessage(message);
                }
                else if (messages[i].type == 'WARNING') {
                  const message = {
                    status: 'warning',
                    dismissable: false,
                    message: messages[i].description
                  };
                  this.get('messageService').addMessage(message);
                }
                else if (messages[i].type == 'INFORMATION') {
                  const message = {
                    status: 'info',
                    dismissable: false,
                    message: messages[i].description
                  };
                  this.get('messageService').addMessage(message);
                }
                else if (messages[i].type == 'SUCCESS') {
                  const message = {
                    status: 'success',
                    dismissable: false,
                    message: messages[i].description
                  };
                  this.get('messageService').addMessage(message);
                }
              }

              const message = {
                status: 'success',
                dismissable: true,
                message: this.get('messageTexts').success_cover_sheet_save
              };

              this.get('messageService').addMessage(message);

              if (this.get('coverSheet.historicPlace') || this.get('coverSheet.humanSubject') || this.get('coverSheet.intlActivities')) {
                const message2 = this.get('showAdditionalInfoMessage');
                this.get('messageService').addMessage(message2);
              }
            }
          }, () => {
            const message = {
              status: 'error',
              dismissable: true,
              displayType: 'noBullet',
              message: this.get('messageTexts').fail_generic
            };
            this.get('messageService').addMessage(message);
          }).then(() => {
            this.set('isSaving', false);
          });
      }
    },

    federalAgencyTrimInput(fieldName, longName, index, maxCharacters, string) {
      string = string.trim();
      const fedAg = this.get('federalAgencies');
      set(fedAg[index], 'fedAgencyNameAbbreviation', string);

      if (isEmpty(this.get('valueOnFocusIn')) && isEmpty(string)) { // don't run it

      }
      else if (isEmpty(this.get('valueOnFocusIn')) ||
           this.get('valueOnFocusIn').toString() !== string) {
        this.send('federalAgencyTextCheck', fieldName, longName, index, maxCharacters, string);
      }
    },

    trimInput(fieldName, longName, maxCharacters, string) {
      string = string.trim();
      this.set(fieldName, string);

      if (isEmpty(this.get('valueOnFocusIn')) && isEmpty(string)) { // don't run it

      }
      else if (isEmpty(this.get('valueOnFocusIn')) ||
           this.get('valueOnFocusIn').toString() !== string) {
        this.send('textCheck', fieldName, longName, maxCharacters, string);
      }
    },

    textCheck(fieldName, longName, maxCharacters, string) {
      this.set('isCoverSheetModified', true);

      const errorName = `${fieldName}Error`;

      if (string.length > maxCharacters) {
        const errorMessage = `${longName} must be ${maxCharacters} characters or less`;
        this.set(errorName, errorMessage);
      }
      else if (!textAllowableCharactersPattern.test(string)) {
        const errorMessage = `${longName} cannot include special characters`;
        this.set(errorName, errorMessage);
      }
      else {
        this.set(errorName, '');
      }
    },
    federalAgencyTextCheck(fieldName, longName, index, maxCharacters, string) {
      this.set('isCoverSheetModified', true);
      const federalAgencies = this.get('federalAgencies');
      const fedAg = federalAgencies.get(index);

      if (fedAg.fedAgencyNameAbbreviation.length > maxCharacters) {
        const errorMessage = `${longName} must be ${maxCharacters} characters or less`;
        set(fedAg, 'fedAgencyError', errorMessage);
      }
      else if (!textAllowableCharactersPattern.test(string)) {
        const errorMessage = `${longName} cannot include special characters`;
        set(fedAg, 'fedAgencyError', errorMessage);
      }
      else {
        set(fedAg, 'fedAgencyError', null);
        this.send('checkFedAgDupes');
      }
    },

    checkFedAgDupes() {
      const federalAgencies = this.get('federalAgencies');
      const errorMessage = 'You cannot have duplicate Federal Agencies';
      for (let j = 0; j < federalAgencies.length; j += 1) {
        const fedAg = federalAgencies.get(j);
        const currentErrorMessage = fedAg.fedAgencyError;

        if (isEmpty(fedAg.fedAgencyNameAbbreviation)) {
          set(fedAg, 'fedAgencyError', null);
          continue;
        }

        if (isEmpty(currentErrorMessage) || currentErrorMessage === errorMessage) { // if there is already another error, don't change that error
          let hasError = false;
          for (let i = 0; i < j; i += 1) {
            const compareAg = federalAgencies.get(i);
            if (isEmpty(compareAg.fedAgencyNameAbbreviation)) {
              continue;
            }
            if ((compareAg.fedAgencyNameAbbreviation).toLowerCase() === (fedAg.fedAgencyNameAbbreviation).toLowerCase()) {
              set(fedAg, 'fedAgencyError', errorMessage);
              hasError = true;
              break;
            }
          }
          if (!hasError) {
            set(fedAg, 'fedAgencyError', null);
          }
        }
      }
    },

    durationCheck(string) {
      this.set('isCoverSheetModified', true);
      const errorName = 'coverSheet.proposalDurationError';
      if (!proposalDurationPattern.test(string)) {
        const errorMessage = 'Proposed Duration may only include whole numbers';
        this.set(errorName, errorMessage);
      }
      else if (string.length > 3) {
        const errorMessage = 'Proposed Duration must be three digits or less';
        this.set(errorName, errorMessage);
      }
      else {
        this.set(errorName, null);
      }
    },


    durationFocusOut(string) {
      if (!isEmpty(string) && !(/(?!^\d+$)^.+$/.test(string))) {
        string = `${parseInt(string.trim(), 10)}`;
      }

      if (isEmpty(this.get('valueOnFocusIn')) && isEmpty(string)) { // don't run it

      }
      else if (isEmpty(this.get('valueOnFocusIn')) ||
           this.get('valueOnFocusIn').toString() !== string) { // if the value on focus out is the same as focus in
        this.set('coverSheet.proposalDuration', string);
        this.send('durationCheck', string);
      }
    },

    validDateCheck(moment, fieldName, longName) {
      this.set('isCoverSheetModified', true);
      const errorName = `${fieldName}Error`;

      const input = $(`label:contains('${longName}')`).parent().find('input');

      // see 'app/overrides/datetime-picker.js' for validation format settings
      if (moment && !moment.isValid()) {
        const errorMessage = 'Not a valid date'; // longName +" must follow the format mm/dd/yyyy";
        this.set(`coverSheet.${errorName}`, errorMessage);
        this.set(`coverSheet.${fieldName}`, null);
        $(input).addClass('error');
      }
      else if (moment && moment.isValid() && moment.isBefore(this.get('minRequestedStartDate'), 'day') && fieldName === 'requestedStartDate') {
        const errorMessage = `${longName} must be later than today's date`;
        this.set(`coverSheet.${errorName}`, errorMessage);
        this.set(`coverSheet.${fieldName}`, null);
        $(input).addClass('error');
      }
      else if (moment && moment.isValid()) {
        $(input).removeClass('error');
        this.set(`coverSheet.${errorName}`, null);
        this.set(`coverSheet.${fieldName}`, moment.format(dateInputFormat));
      }
    },
    irbFocusOut(event) {
      const string = event.target.value;

      if (isEmpty(this.get('valueOnFocusIn')) && isEmpty(string)) { // don't run it

      }
      else if (isEmpty(this.get('valueOnFocusIn')) ||
           this.get('valueOnFocusIn').toString() !== string) {
        this.send('dateFocusOut', string, 'iRbAppDate', 'IRB Approval Date');
      }
    },
    iAcucSFocusOut(event) {
      const string = event.target.value;

      if (isEmpty(this.get('valueOnFocusIn')) && isEmpty(string)) { // don't run it

      }
      else if (isEmpty(this.get('valueOnFocusIn')) ||
           this.get('valueOnFocusIn').toString() !== string) {
        this.send('dateFocusOut', string, 'iAcucSAppDate', 'IACUC Approval Date');
      }
    },
    requestedStartDateFocusOut(event) {
      const string = event.target.value;

      if (isEmpty(this.get('valueOnFocusIn')) && isEmpty(string)) { // don't run it

      }
      else if (isEmpty(this.get('valueOnFocusIn')) ||
           this.get('valueOnFocusIn').toString() !== string) {
        this.send('dateFocusOut', string, 'requestedStartDate', 'Requested Start Date');
      }
    },
    dateFocusOut(string, fieldName, longName) {
      const valueOnFocusIn = this.get('valueOnFocusIn').toString();
      const currentValue = this.get(`coverSheet.${fieldName}`);
      if (valueOnFocusIn !== currentValue) {
        this.set('isCoverSheetModified', true);
      }

      if (isEmpty(string)) {
        this.send('dateEmpty', string, fieldName, longName);
      }
      else if (monthDayYearFocusOut.test(string)) {
        const inputMoment = moment(string, dateInputFormat);
        this.send('validDateCheck', inputMoment, fieldName, longName);
      }
      else {
        const errorMessage = `${longName} must follow the format mm/dd/yyyy`;
        const errorName = `${fieldName}Error`;
        this.set(`coverSheet.${errorName}`, errorMessage);
        this.set(`coverSheet.${fieldName}`, null);
        const input = $(`label:contains('${longName}')`).parent().find('input');
        $(input).addClass('error');
      }
    },
    keyStrokeDateCheck(string, fieldName, longName) {
      const input = $(`label:contains('${longName}')`).parent().find('input');

      const val = input.val();
      const totalLength = val.length;
      const atEnd = val.slice(0, input[0].selectionStart).length === totalLength;

      const errorName = `${fieldName}Error`;
      if (isEmpty(string)) {
        this.send('dateEmpty', string, fieldName, longName);
      }
      else if (monthDayYearFocusOut.test(string) && (atEnd || totalLength === 10)) { // If they are at the end of the date, format it the date if possible, where 10 is the number of characters in a well formed MM/DD/YYYY date
        const inputMoment = moment(string, dateInputFormat);
        this.send('validDateCheck', inputMoment, fieldName, longName);
      }
      else if (!monthDayYearTyping.test(string)) {
        const errorMessage = `${longName} must follow the format mm/dd/yyyy`;
        this.set(`coverSheet.${errorName}`, errorMessage);
        this.set(`coverSheet.${fieldName}`, null);
        $(input).addClass('error');
      }
      else if (monthDayYearFocusOut.test(string) && moment(string).isBefore(this.get('minRequestedStartDate'), 'day') && fieldName === 'requestedStartDate') {
        const errorMessage = `${longName} must be later than today's date`;
        this.set(`coverSheet.${errorName}`, errorMessage);
        this.set(`coverSheet.${fieldName}`, null);
      }
      else {
        $(input).removeClass('error');
        this.set(`coverSheet.${errorName}`, null);
      }
    },
    dateEmpty(string, fieldName, longName) {
      const errorName = `${fieldName}Error`;
      const input = $(`label:contains('${longName}')`).parent().find('input');
      $(input).removeClass('error');
      $(input).val('');
      this.set(`coverSheet.${errorName}`, null);
      if (!isEmpty(this.set(`coverSheet.${fieldName}`))) {
        this.set('isCoverSheetModified', true);
      }
      this.set(`coverSheet.${fieldName}`, '');
    },

    postalCodeCheck(string, focusOut) {
      if (focusOut !== true) focusOut = false;

      this.set('isCoverSheetModified', true);

      const errorName = 'ppop.postalCodeError';

      if (isEmpty(string)) {
        this.set(errorName, null);
      }

      const isCountryUS = this.get('ppop').countryCode === 'US';

      if (isCountryUS) {
        if (/^\d{5,9}$/.test(string)) { // Add a dash
          string = `${string.substring(0, 5)}-${string.slice(5, string.length)}`;
          this.set('ppop.postalCode', string);
        }
        if (isEmpty(string) || usPostalCode.test(string)) {
          this.set(errorName, null);
        }
        else if (focusOut && string.replace(/[^0-9]/g, '').length !== 9) {
          this.set(errorName, 'Postal Code must be 9 digits');
        }
        else if ((/^\d*-{0,1}\d*$/.test(string)) && string.length > 10) {
          this.set(errorName, 'Postal Code must be 9 digits');
        }
        else if (!(/^\d*-{0,1}\d*$/.test(string))) {
          if (string.length > 10) {
            this.set(errorName, 'Postal Code must be 9 digits');
          }
          else {
            this.set(errorName, 'Postal Code cannot include special characters');
          }
        }
        else if (usPostalCodeEndsInZeros.test(string)) {
          this.set(errorName, 'Postal Code cannot end in 0000');
        }
        else {
          this.set(errorName, null);
        }
      }
      else {
        this.set(errorName, null);
      }
    },
    postalCodeFocusOut(string) {
      string = string.trim();
      this.set('ppop.postalCode', string);

      if (isEmpty(this.get('valueOnFocusIn')) && isEmpty(string)) { // don't run it

      }
      else if (isEmpty(this.get('valueOnFocusIn')) ||
           this.get('valueOnFocusIn').toString() !== string) {
        this.send('postalCodeCheck', string, true);
      }
    },

    addFederalAgency() {
      this.set('isCoverSheetModified', true);
      this.get('federalAgencies').pushObject({
        fedAgencyNameAbbreviation: ''
      });
    },
    deleteFederalAgency(fedAg) {
      if (isEmpty(fedAg.fedAgencyNameAbbreviation.trim())) {
        const federalAgencies = this.get('federalAgencies');
        federalAgencies.removeObject(fedAg);
      }
      else {
        this.set('federalAgencyToDelete', fedAg);
        $('#deleteFederalAgencyModal').show();
      }
    },
    confirmDeleteFederalAgency() {
      this.set('isCoverSheetModified', true);
      const federalAgencies = this.get('federalAgencies');
      federalAgencies.removeObject(this.get('federalAgencyToDelete'));
      this.send('clearFederalAgencyToDelete');
    },
    clearFederalAgencyToDelete() {
      this.set('federalAgencyToDelete', null);
      this.send('checkFedAgDupes');
      $('#deleteFederalAgencyModal').hide();
    },

    addIACountry() {
      if (this.get('internationalActyCountriesDisabled')) {
        return;
      }
      this.set('isCoverSheetModified', true);
      const tempCountry = {
        'intlCountryCode': '',
        'intlCountryName': ''
      };
      this.get('internationalActyCountries').pushObject(tempCountry);
    },
    selectIACountry(index, countryCode) {
      const iaCountries = this.get('internationalActyCountries');
      if (isEmpty(countryCode)) {
        iaCountries.replace(index, 1, [{
          intlCountryCode: '',
          intlCountryName: '',
          intlCountryError: ''
        }]);
      }
      else {
        const countryObject = this.get('countries').findBy('countryCode', countryCode);
        const intlCountry = {
          'intlCountryCode': countryObject.countryCode,
          'intlCountryName': countryObject.countryName
        };
        iaCountries.replace(index, 1, [intlCountry]);
        this.send('checkIADupes');
      }
    },
    checkIADupes() {
      const iaCountries = this.get('internationalActyCountries');
      const errorMessage = 'You cannot have duplicate countries';

      for (let j = 0; j < iaCountries.length; j += 1) {
        const iaCountry = iaCountries.get(j);
        if (isEmpty(iaCountry.intlCountryCode)) {
          continue;
        }

        let hasError = false;
        for (let i = 0; i < j; i += 1) {
          const compareCountry = iaCountries.get(i);
          if (isEmpty(compareCountry.intlCountryCode)) {
            continue;
          }
          if (compareCountry.intlCountryCode === iaCountry.intlCountryCode) {
            hasError = true;
            set(iaCountry, 'intlCountryError', errorMessage);
            break;
          }
        }
        if (!hasError) {
          set(iaCountry, 'intlCountryError', null);
        }
      }
    },
    deleteIACountry(country, index) {
      if (isEmpty(country)) {
        const iaCountries = this.get('internationalActyCountries');
        iaCountries.removeAt(index);
      }
      else {
        this.set('iaCountryIndexToDelete', index);
        $('#deleteCountryModal').show();
      }
    },
    confirmDeleteCountry() {
      const index = this.get('iaCountryIndexToDelete');
      const iaCountries = this.get('internationalActyCountries');
      iaCountries.removeAt(index);
      this.send('checkIADupes');
      this.send('clearDeleteCountry');
    },
    clearDeleteCountry() {
      this.set('iaCountryIndexToDelete', null);
      $('#deleteCountryModal').hide();
    },

    deselectInfo(section) {
      let deselection = false;

      switch (section) {
        case this.get('beginningInvestigatorName'):
          if (!this.get('coverSheet.beginningInvestigator')) {
            this.set('coverSheet.beginningInvestigator', true);
          }
          else {
            this.set('coverSheet.beginningInvestigator', false);
          }
          break;
        case this.get('lobbyingActivitiesName'):
          if (!this.get('coverSheet.disclosureLobbyActy')) {
            this.set('coverSheet.disclosureLobbyActy', true);
          }
          else {
            this.set('coverSheet.disclosureLobbyActy', false);
          }
          break;
        case this.get('propPrivInfoName'):
          if (!this.get('coverSheet.proprietaryPrivileged')) {
            this.set('coverSheet.proprietaryPrivileged', true);
          }
          else {
            this.set('coverSheet.proprietaryPrivileged', false);
          }
          break;
        case this.get('historicPlacesName'):
          if (!this.get('coverSheet.historicPlace')) {
            this.set('coverSheet.historicPlace', true);
          }
          else {
            this.set('coverSheet.historicPlace', false);
          }
          break;
        case this.get('vertebrateAnimalsName'):
          if (!this.get('coverSheet.vertebrateAnimal')) {
            this.set('coverSheet.vertebrateAnimal', true);
          }
          else if (this.get('coverSheet.vrtbAnimalAPType')) {
            deselection = true;
          }
          else {
            this.set('coverSheet.vertebrateAnimal', false);
          }
          break;
        case this.get('humanSubjectsName'):
          if (!this.get('coverSheet.humanSubject')) {
            this.set('coverSheet.humanSubject', true);
          }
          else if (this.get('coverSheet.humanSubjectsAPEType')) {
            deselection = true;
          }
          else {
            this.set('coverSheet.humanSubject', false);
          }
          break;
        case this.get('internationalActivitiesName'):
          if (!this.get('coverSheet.intlActivities')) {
            this.set('coverSheet.intlActivities', true);
          }
          else if ((this.get('internationalActyCountries').length > 1) || !isEmpty(this.get('internationalActyCountries')[0].intlCountryCode)) {
            deselection = true;
          }
          else {
            this.set('coverSheet.intlActivities', false);
          }
          break;
        default:
      }

      if (deselection) {
        this.set('deselectionName', section);
        $('#infoDeselectWarningModal').show();
      }
      else {
        this.set('isCoverSheetModified', true);
        $(`input[name='${section}']`).prop('checked', true);
      }
    },
    clearDeselectInfo() {
      this.set('deselectionName', null);
      $('#infoDeselectWarningModal').hide();
    },
    cancelDeselectInfo() {
      $(`input[name='${this.get('deselectionName')}']`).prop('checked', true);

      this.send('clearDeselectInfo');
    },
    confirmDeselectInfo() {
      this.set('isCoverSheetModified', true);

      switch (this.get('deselectionName')) {
        case this.get('beginningInvestigatorName'):
          break;
        case this.get('lobbyingActivitiesName'):
          break;
        case this.get('propPrivInfoName'):
          break;
        case this.get('historicPlacesName'):
          break;
        case this.get('vertebrateAnimalsName'):
          this.set('coverSheet.vertebrateAnimal', false);
          this.set('coverSheet.vrtbAnimalAPType', null);
          this.set('coverSheet.iAcucSAppDate', null);
          this.set('coverSheet.iAcucSAppDateError', null);
          this.set('coverSheet.animalWelfareAssuNumber', null);
          this.set('coverSheet.animalWelfareAssuNumberError', null);
          break;
        case this.get('humanSubjectsName'):
          this.set('coverSheet.humanSubject', false);
          this.set('coverSheet.humanSubjectsAPEType', null);
          this.set('coverSheet.iRbAppDate', null);
          this.set('coverSheet.iRbAppDateError', null);
          this.set('coverSheet.humanSubjectAssuNumber', null);
          this.set('coverSheet.humanSubjectAssuNumberError', null);
          this.set('coverSheet.exemptionSubsection', null);
          this.set('coverSheet.exemptionSubsectionError', null);
          break;
        case this.get('internationalActivitiesName'):
          this.set('coverSheet.intlActivities', false);
          this.set('internationalActyCountries', [{
            intlCountryCode: '',
            intlCountryName: ''
          }]);
          break;
        default:
      }

      $(`input[name='${this.get('deselectionName')}']`).prop('checked', false);
      this.send('clearDeselectInfo');
    },

    cancelChangeSelection() {
      this.send(this.get('cancelChangeSelection'));
    },
    confirmChangeSelection() {
      this.send(this.get('confirmChangeSelection'));
    },
    clearChangeSelectionSetup() {
      this.set('confirmChangeSelection', null);
      this.set('cancelChangeSelection', null);
      $('#changeSelectionWarningModal').hide();
    },

    changeVertebrateAnimalsSelection(value) {
      if (value === 'pending' && (!isEmpty(this.get('coverSheet.iAcucSAppDate')) ||
        !isEmpty(this.get('coverSheet.iAcucSAppDateError')) || !isEmpty(this.get('coverSheet.animalWelfareAssuNumber')))) {
        this.set('confirmChangeSelection', 'confirmVertebrateAnimalsSelectionChange');
        this.set('cancelChangeSelection', 'cancelVertebrateAnimalsSelectionChange');

        const input = $('label[data-date-field-name=\'iAcucSAppDate\']').find('input');
        this.set('calendarVal', $(input).val());
        $(input).off('keyup');


        $('#changeSelectionWarningModal').show();
      }
      else {
        this.send('clearVertebrateAnimalsValues');
        this.send('setJqueryCalendarBinding', 'iAcucSAppDate');
        this.set('isCoverSheetModified', true);
      }
    },
    confirmVertebrateAnimalsSelectionChange() {
      this.set('calendarVal', null);
      this.set('isCoverSheetModified', true);
      this.set('coverSheet.vrtbAnimalAPType', 'pending');
      this.send('clearVertebrateAnimalsValues');
      this.send('clearChangeSelectionSetup');
    },
    cancelVertebrateAnimalsSelectionChange() {
      this.set('coverSheet.vrtbAnimalAPType', 'approved');
      this.send('rememberCalendarValue', 'iAcucSAppDate', 'IACUC Approval Date');
      this.send('clearChangeSelectionSetup');
    },
    clearVertebrateAnimalsValues() {
      this.set('coverSheet.iAcucSAppDate', null);
      this.set('coverSheet.iAcucSAppDateError', null);
      this.set('coverSheet.animalWelfareAssuNumber', null);
      this.set('coverSheet.animalWelfareAssuNumberError', null);
    },

    changeHumanSubjectsSelection(value) {
      const leavingApprovedWithContent = (value === 'pending' || value === 'exempt') &&
        (!isEmpty(this.get('coverSheet.humanSubjectAssuNumber')) || !isEmpty(this.get('coverSheet.iRbAppDate')) || !isEmpty(this.get('coverSheet.iRbAppDateError')));

      const leavingExemptWithContent = (value === 'pending' || value === 'approved') && !isEmpty(this.get('coverSheet.exemptionSubsection'));

      if (leavingApprovedWithContent || leavingExemptWithContent) {
        if (leavingApprovedWithContent) {
          const input = $('label[data-date-field-name=\'iRbAppDate\']').find('input');
          this.set('calendarVal', $(input).val());
        }

        this.set('confirmChangeSelection', 'confirmHumanSubjectsSelectionChange'); // set the action on the modal
        this.set('cancelChangeSelection', 'cancelHumanSubjectsSelectionChange');
        this.set('newHumanSubjectSelection', value);
        $('#changeSelectionWarningModal').show();
      }
      else {
        if (value === 'approved') {
          this.send('setJqueryCalendarBinding', 'iRbAppDate');
        }
        else {
          const input = $('label[data-date-field-name=\'iRbAppDate\']').find('input');
          $(input).off('keyup');
        }
        this.set('originalHumanSubjectSelection', value);
        this.set('isCoverSheetModified', true);
      }
    },
    confirmHumanSubjectsSelectionChange() {
      this.set('calendarVal', null);
      this.set('isCoverSheetModified', true);
      this.set('originalHumanSubjectSelection', this.get('newHumanSubjectSelection'));
      this.send('clearHumanSubjectsValues');
      this.send('clearChangeSelectionSetup');
    },
    cancelHumanSubjectsSelectionChange() {
      this.set('coverSheet.humanSubjectsAPEType', this.get('originalHumanSubjectSelection'));
      this.send('rememberCalendarValue', 'iRbAppDate', 'IRB Approval Date');
      this.send('clearChangeSelectionSetup');
    },
    clearHumanSubjectsValues() {
      this.set('coverSheet.iRbAppDate', null);
      this.set('coverSheet.iRbAppDateError', null);
      this.set('coverSheet.humanSubjectAssuNumber', null);
      this.set('coverSheet.humanSubjectAssuNumberError', null);
      this.set('coverSheet.exemptionSubsection', null);
      this.set('coverSheet.exemptionSubsectionError', null);
    },

    selectNewAwardeeOrg(orgId) {
      if (isBlank(orgId)) {
        this.set('selectedNewAwardeeOrg', null);
        return;
      }

      const selectedAwardeeOrg = this.get('allAwardeeOrgs').filterBy('id', orgId);
      this.set('selectedNewAwardeeOrg', selectedAwardeeOrg.get(0));
    },

    openChangeAwardeeOrgModal() {
      if (this.get('isCoverSheetModified')) {
        const modal = $("div .modal[id*='-unsavedExitConfirmationModal']")[1]; // this unsaved modal is imported second
        $(modal).modal();
        return false;
      }

      $('#changeAwardeeOrgModal').modal('show');
    },
    continueChangeAwardeeOrganization() {
      this.set('isCoverSheetModified', false);
      this.send('openChangeAwardeeOrgModal');
    },

    closeChangeAwardeeOrgModal() {
      if (this.get('selectNewAwardeeOrgOptions').length > 1) {
        this.set('selectedNewAwardeeOrg', null);
      }
      $('#changeAwardeeOrgModal').find('select').val('');
    },

    changeAwardeeOrg() {
      this.get('messageService').clearActionMessages();

      this.get('coverSheetService').updateAwardeeOrg({
        propPrepId: this.get('propPrepId'),
        propRevId: this.get('propRevId'),
        coverSheetId: this.get('coverSheet').coverSheetId,
        selectedNewAwardeeOrg: this.get('selectedNewAwardeeOrg')
      }).then(() => {
        const message = {
          status: 'success',
          dismissable: true,
          message: this.get('messageTexts').awardee_org_change_success
        };
        this.get('messageService').addMessage(message);
        this.get('proposalController').send('reloadProposal'); // TODO Screen Messges Service If this call fails, need to show message
      }, () => {
        const message = {
          status: 'error',
          dismissable: false,
          message: this.get('messageTexts').fail_generic
        };
        this.get('messageService').addMessage(message);
      });
    },

    selectState(stateCode) {
      this.set('isCoverSheetModified', true);
      if (isBlank(stateCode)) {
        this.set('ppop.stateCode', null);
        return;
      }
      this.set('ppop.stateCode', stateCode);
    },
    selectCountry(countryCode) {
      this.set('isCoverSheetModified', true);

      if (isBlank(countryCode)) {
        this.set('ppop.countryCode', null);
        return;
      }
      this.set('ppop.countryCode', countryCode);

      if (countryCode !== 'US') {
        this.set('ppop.stateCode', null);
        $('#ppop-state-select').find('select').val('');
        this.send('postalCodeCheck', this.get('ppop.postalCode'), true);
      }
      else {
        this.send('postalCodeCheck', this.get('ppop.postalCode'), true);
      }
    },

    setJqueryCalendarBinding(fieldName) {
      const self = this;
      const checkExist = setInterval(() => {
        const input = $(`label[data-date-field-name='${fieldName}']`).parent().find('input')[0];
        if ($(input).is(':visible')) {
          $(input).on('keyup', (e) => {
            run(() => {
              const label = $(e.target).closest('div').siblings('label').length > 0 ? $(e.target).closest('div').siblings('label') : $(e.target).closest('label');
              const longName = label.attr('data-date-long-name');
              const string = $(e.target)[0].value;
              self.send('keyStrokeDateCheck', string, fieldName, longName);
            });
          });

          clearInterval(checkExist);
        }
      }, 100);
    },
    rememberCalendarValue(fieldName, longName) {
      const calVal = this.get('calendarVal');
      if (calVal) {
        const self = this;
        const checkExist = setInterval(() => {
          const input = $(`label[data-date-field-name='${fieldName}']`).find('input');

          if ($(input).is(':visible')) {
            $(input).val(calVal);
            self.send('keyStrokeDateCheck', calVal, fieldName, longName);
            self.set('calendarVal', null);

            $(input).on('keyup', (e) => {
              run(() => {
                const string = $(e.target)[0].value;
                self.send('keyStrokeDateCheck', string, fieldName, longName);
              });
            });

            clearInterval(checkExist);
          }
        }, 100);
      }
    },

    // Add this action in template when we want to trigger a change to isCoverSheetModified
    coversheetChange() {
      this.set('isCoverSheetModified', true);
    },
    setFocusInValue(value) {
      value = value ? value.toString().trim() : '';
      this.set('valueOnFocusIn', value);
    },
    setCalendarFocusInValue(event) {
      const string = event.target.value;
      this.get('analytics').trackEvent('The requested start date calendar button has been clicked');
      this.set('valueOnFocusIn', string.trim());
    },

    exitCoverSheetConfirmed() {
      this.set('isCoverSheetModified', false);
      this.transitionToRoute(this.get('exitCoverSheetTransition'));
      this.set('exitCoverSheetTransition', null);
    },
    exitCoverSheetCancelled() {
      $('#allItems li').removeClass('activated');
      $('[data-test-nav-cover-sheet]').addClass('activated');
      this.set('exitCoverSheetTransition', null);
    },

    viewFile() {
      const hasValidationErrors = this.validate();
      this.set('isFormSubmission', false);
      this.get('analytics').trackEvent('Preview Print button_Cover Sheet page');

      if (hasValidationErrors.hasValidationErrors) {
        const messageText = `The preview cannot be generated until the following errors are fixed:<ul style="list-style-type: disc"><li>${hasValidationErrors.message.message}</li></ul>`;
        const message = {status: 'error', dismissable: false, message: messageText};
        this.get('messageService').addMessage(message);
      }
      else {
        const urlForViewFile = this.get('props').getReplace('apis.coverSheet.fileView', [this.get('propPrepId'), this.get('propRevId')]);
        this.get('customForm').postUrlUserToken(urlForViewFile);
      }
    }

  }

});
