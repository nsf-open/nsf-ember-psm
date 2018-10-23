import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import { isEmpty } from '@ember/utils';
import { run } from '@ember/runloop';
import { set } from '@ember/object';
import $ from 'jquery';

export default Component.extend({
  activeUser: service('active-user'),
  analytics: service('webtrend-analytics'),
  directorateService: service('directorate'),
  props: service('properties'),
  session: service('session'),

  nextDisabledTitleText: 'At least one selection must be saved before you can proceed.',
  addUOCDisabledTitleText: 'Please make a selection first.',

  directorates: computed(function() {
    return [];
  }),
  shownDirectorates: computed('directorates.@each.isAvailable', function() {
    const directorates = this.get('directorates');
    const availableDirectorates = directorates.filterBy('isAvailable', true);
    if (availableDirectorates.length === 1) {
      this.set('selectedDirectorate', availableDirectorates[0]);

      if (directorates.length > 1) {
        if (availableDirectorates[0].divisions === undefined) { // If there is only one directorate, we've already pulled it's divisions
          this.callDivisionsPrograms();
        }
        else {
          this.set('divisions', availableDirectorates[0].divisions);
        }
      }
    }
    return availableDirectorates;
  }),

  divisions: computed(function() {
    return [];
  }),
  shownDivisions: computed('divisions.@each.isAvailable', function() {
    const divisions = this.get('divisions').filterBy('isAvailable', true);
    this.clearPrograms();
    if (divisions.length === 1) {
      this.set('selectedDivision', divisions[0]);
      this.set('programs', divisions[0].programElements);
    }
    return divisions;
  }),

  programs: computed(function() {
    return [];
  }),
  shownPrograms: computed('programs.@each.isAvailable', function() {
    const programs = this.get('programs').filterBy('isAvailable', true);
    if (programs.length === 1) {
      this.set('selectedProgram', programs[0]);
    }
    return programs;
  }),

  numUOCs: computed('wizard.uocs.[]', function() {
    return this.get('wizard').get('uocs').length - 1;
  }),

  selectedDirectorate: null,
  selectedDivision: null,
  selectedProgram: null,

  divisionSelectDisabled: computed('divisions.[]', 'selectedDirectorate', function() {
    if (this.get('selectedDirectorate') !== null && this.get('divisions').length > 0) {
      return false;
    }
    return true;
  }),

  programSelectDisabled: computed('programs.[]', 'selectedDivision', function() {
    if (this.get('selectedDivision') !== null && this.get('programs').length > 0) {
      return false;
    }
    return true;
  }),

  addUOCDisabled: computed('selectedDirectorate', 'selectedDivision', 'selectedProgram', function() {
    if (this.get('selectedProgram') !== null &&
          this.get('selectedDivision') !== null &&
          this.get('selectedDirectorate') !== null) {
      return false;
    }
    else { return true; }
  }),

  addUOCDisabledTitle: computed('selectedDirectorate', 'selectedDivision', 'selectedProgram', function() {
    if (this.get('selectedProgram') !== null &&
      this.get('selectedDivision') !== null &&
      this.get('selectedDirectorate') !== null) {
      return '';
    }
    else { return this.get('addUOCDisabledTitleText'); }
  }),


  nextDisabled: computed('wizard.uocs.[]', 'readOnly', function() {
    if (this.get('readOnly')) { return false; }
    if (this.get('wizard').get('uocs') === undefined) { return true; }

    return this.get('wizard').get('uocs').length <= 0;
  }),

  nextDisabledTitle: computed('wizard.uocs.[]', 'readOnly', function() {
    if (this.get('readOnly')) { return ''; }
    if (this.get('wizard').get('uocs') === undefined) { return this.get('nextDisabledTitleText'); }

    if (this.get('wizard').get('uocs').length <= 0) {
      return this.get('nextDisabledTitleText');
    }
    return '';
  }),

  foID: null,
  readOnly: false,

  willInsertElement() {
    const fundingOpId = this.get('wizard').get('fundingOp').fundingOpportunityId;
    this.set('foID', fundingOpId);

    const wizardDirectorates = this.get('wizard').get('directorates');

    if (!isEmpty(wizardDirectorates)) {
      this.set('directorates', wizardDirectorates);
      // if one directorate
      if (this.get('directorates').length === 1) {
        // set selected directorate
        this.set('selectedDirectorate', this.get('directorates')[0]);

        if (this.get('selectedDirectorate').divisions === undefined) { // If there is only one directorate, we've already pulled it's divisions
          this.callDivisionsPrograms();
        }
        else {
          this.set('divisions', this.get('selectedDirectorate').divisions);

          if (this.get('divisions').length === 1) {
            this.set('selectedDivision', this.get('divisions')[0]);
            this.set('programs', this.get('divisions')[0].programElements);

            if (this.get('selectedDivision').programElements.length === 1) {
              this.set('selectedProgram', this.get('selectedDivision').programElements[0]);
              this.set('readOnly', true);
            }
          }
        }
      }
    }
    else {
      this.get('directorateService').getDirectorates({fundingOppId: this.get('foID')}).then((response) => {
          function addFieldsToDirectorate(directorate) {
            directorate.isAvailable = true;
          }
          response.directorates.map(addFieldsToDirectorate);
          this.get('wizard').set('directorates', response.directorates);
          this.set('directorates', response.directorates);

          if (this.get('directorates').length === 1) {
            // set selected directorate
            this.set('selectedDirectorate', this.get('directorates')[0]);

            this.callDivisionsPrograms();
          }
        }, () => {
          this.get('error')();
        });
    }
  },
  didInsertElement() {
    $('#uocDeleteModal').on('show.bs.modal', run.bind(this, (event) => {
      const button = $(event.relatedTarget);
      const programElementCode = button.data('program-code');
      // let programTitle = button.data('program-title');

      const divisionCode = button.data('division-code');
      const directorateCode = button.data('directorate-code');

      const codes = {
        directorateCode,
        divisionCode,
        programElementCode
      };

      const uocs = this.get('wizard').get('uocs');
      const isFound = uocs.find(this.byUOCCodes, codes);

      this.set('modalDeleteUOC', isFound);
    }));
  },
  actions: {
    next() {
      this.get('next')();
    },
    previous() {
      this.get('previous')();
    },

    selectDirectorate(directorateCode) {
      this.clearDivisions();
      if (this.isEmpty(directorateCode)) { // Empty Selection
        this.set('selectedDirectorate', null);
        this.clearDivisions();
      }
      else {
        // find the directorate
        const directorates = this.get('directorates');
        const directorate = directorates.find(this.byDirectorateCode, directorateCode);
        this.set('selectedDirectorate', directorate);

        if (directorate.divisions === undefined) {
          this.callDivisionsPrograms();
        }
        else {
          this.set('divisions', directorate.divisions);
        }
      }

      return true;
    },
    selectDivision(divisionCode) {
      this.clearPrograms();
      if (this.isEmpty(divisionCode)) { // Empty Selection
        this.set('selectedDivision', null);
        return true;
      }
      else {
        const divisions = this.get('divisions');
        const division = divisions.find(this.byDivisionCode, divisionCode);
        this.set('selectedDivision', division);

        this.set('programs', division.programElements);

        if (division.programElements.length === 1) {
          this.set('selectedProgram', division.programElements[0]);
        }
      }

      // return true;
    },
    selectProgram(programElementCode) {
      if (this.isEmpty(programElementCode)) { // Empty Selection
        this.set('selectedProgram', null);
      }
      else {
        const programs = this.get('programs');
        const program = programs.find(this.byProgramElementCode, programElementCode);
        this.set('selectedProgram', program);
      }

      // return true;
    },
    addUOC() {
      if (this.selectedProgram !== null &&
        this.selectedDivision !== null && this.selectedDirectorate !== null) {
        const uoc = {
          directorate: {directorateCode: this.selectedDirectorate.directorateCode, directorateAbbrv: this.selectedDirectorate.directorateAbbrv, directorateName: this.selectedDirectorate.directorateName},
          division: {divisionCode: this.selectedDivision.divisionCode, divisionAbbrv: this.selectedDivision.divisionAbbrv, divisionName: this.selectedDivision.divisionName},
          programElement: {programElementCode: this.selectedProgram.programElementCode, programElementName: this.selectedProgram.programElementName}
        };
        this.get('analytics').trackEvent('Save Selection button_Where to Apply');
        set(this.get('selectedProgram'), 'isAvailable', false);

        const wizard = this.get('wizard');

        if (wizard.get('uocs') === undefined) {
          wizard.set('uocs', []);
        }
        const uocs = wizard.get('uocs');

        const isFound = uocs.find(this.byUOC, uoc);

        if (isFound === undefined) {
          uocs.pushObject(uoc);
        }

        const shownProgramsLength = this.get('shownPrograms').length;
        if (shownProgramsLength === 0) {
          set(this.get('selectedDivision'), 'isAvailable', false);
        } else if (shownProgramsLength > 1) {
          this.set('selectedProgram', null);
        }

        const shownDivisionsLength = this.get('shownDivisions').length;
        if (shownDivisionsLength === 0) {
          set(this.get('selectedDirectorate'), 'isAvailable', false);
        } else if (shownDivisionsLength > 1) {
          this.set('selectedDivision', null);
          this.clearPrograms();
        }

        const shownDirectoratesLength = this.get('shownDirectorates').length;
        if (shownDirectoratesLength > 1) {
          this.set('selectedDirectorate', null);
          this.clearDivisions();
        }

      }
      return true;
    },
    deleteUOC(uoc) {
      const uocs = this.get('wizard').get('uocs');
      const foundUoc = uocs.find(this.byUOC, uoc);

      const directorate = this.get('directorates').find(this.byDirectorateCode, foundUoc.directorate.directorateCode);
      const division = directorate.divisions.find(this.byDivisionCode, foundUoc.division.divisionCode);
      const program = division.programElements.find(this.byProgramElementCode, foundUoc.programElement.programElementCode);

      uocs.removeObject(uoc);
      set(program, 'isAvailable', true);
      set(division, 'isAvailable', true);
      set(directorate, 'isAvailable', true);

      this.set('selectedProgram', null);

      const shownDivisionsLength = this.get('shownDivisions').length;
      if (shownDivisionsLength > 1) {
        this.set('selectedDivision', null);
        this.clearPrograms();
      }

      const shownDirectoratesLength = this.get('shownDirectorates').length;
      if (shownDirectoratesLength > 1) {
        this.set('selectedDirectorate', null);
        this.clearDivisions();
      }

      return true;
    },
    moveUOCUp(uoc) {
      const uocs = this.get('wizard').get('uocs');
      const index = uocs.indexOf(uoc);
      uocs.removeObject(uoc);
      uocs.insertAt(index - 1, uoc);
      return true;
    },
    moveUOCDown(uoc) {
      const uocs = this.get('wizard').get('uocs');
      const index = uocs.indexOf(uoc);
      uocs.removeObject(uoc);
      uocs.insertAt(index + 1, uoc);
      return true;
    },
  },

  isEmpty(str) {
    return (!str || str.length === 0 || /^\s*$/.test(str));
  },
  buildDirectoratesUrl() {
    return this.get('props').getReplace('apis.wizard.directorates', [this.get('foID')]);
  },
  buildDivisionsProgramsUrl() {
    return this.get('props').getReplace('apis.wizard.divisions', [this.get('foID'), this.get('selectedDirectorate').directorateCode]);
  },
  byDirectorateCode(directorate) {
    return directorate.directorateCode === this.toString();
  },
  byDivisionCode(division) {
    return division.divisionCode === this.toString();
  },
  byProgramElementCode(program) {
    return program.programElementCode === this.toString();
  },
  byUOCCodes(uoc) {
    if (uoc.directorate.directorateCode === this.directorateCode.toString() && uoc.division.divisionCode === this.divisionCode.toString()) {
      return uoc.programElement.programElementCode === this.programElementCode.toString();
    }
  },
  byUOC(uoc) {
    if (uoc.directorate.directorateCode === this.directorate.directorateCode.toString() && uoc.division.divisionCode === this.division.divisionCode.toString()) {
      return uoc.programElement.programElementCode === this.programElement.programElementCode.toString();
    }
  },
  callDivisionsPrograms() {
    this.set('isDivisionsLoading', true);

    this.get('directorateService').getDivisions({
      fundingOppId: this.get('foID'),
      directorateCode: this.get('selectedDirectorate').directorateCode
    }).then((response) => {
      const divisions = response.directorate.divisions;
      function addFieldsToProgram(program) {
        program.isAvailable = true;
      }
      function addFieldsToDivision(division) {
        division.isAvailable = true;
        division.programElements.map(addFieldsToProgram);
      }
      divisions.map(addFieldsToDivision);
      this.set('divisions', divisions);

      const directorates = this.get('directorates');
      const directorate = directorates.find(this.byDirectorateCode, this.get('selectedDirectorate').directorateCode);

      // cache the divisions in the directorate
      directorate.divisions = divisions;

      if (this.get('divisions').length === 1) {
        this.set('selectedDivision', this.get('divisions')[0]);
        this.set('programs', this.get('divisions')[0].programElements);

        if (this.get('programs').length === 1) {
          this.set('selectedProgram', this.get('programs')[0]);

          if (this.get('programs').length === 1 && this.get('divisions').length === 1 && this.get('directorates').length === 1) {
            this.set('readOnly', true);
            this.send('addUOC');
          }
        }
        else { // if multiple programs, open the program select
          this.set('selectedProgram', null);
        }
      }
    }, () =>{
      this.get('error')();
    }).then(() => {
      this.set('isDivisionsLoading', false);
    });

    return true;
  },
  clearDivisions() {
    this.set('selectedDivision', null);
    this.set('divisions', []);
    this.clearPrograms();
  },
  clearPrograms() {
    this.set('selectedProgram', null);
    this.set('programs', []);
  }
});
