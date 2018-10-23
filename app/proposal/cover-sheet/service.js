import Service from '@ember/service';
import { inject as service } from '@ember/service';

export default Service.extend({
  api: service('api'),
  countriesService: service('countries'),

  getCoverSheetData({ propPrepId, propRevId, proposalStatus, propPrepRevnTypeCode }) {
    return Promise.all([
      this.get('api').httpGet('apis.coverSheet.getOrgs', propPrepId, propRevId),
      this.get('api').httpGet('apis.coverSheet.get', propPrepId, propRevId)
    ]).then(([institutions, coverSheet]) => {
      const coverSheetData = {
        propPrepId,
        propRevId,
        proposalStatus,
        propPrepRevnTypeCode,
        countries: this.get('countriesService').getAllCountries(),
        internationalCountries: this.get('countriesService').getInternationalCountries(),
        states: this.get('countriesService').getAllStates(),
        institutions: institutions.institutions,
        coverSheetMessages: coverSheet.messages,
        coverSheet: coverSheet.coverSheet
      };

      if (coverSheetData.coverSheet.proposalDuration === 0) {
        coverSheetData.coverSheet.proposalDuration = '';
      }

      return coverSheetData;
    });
  },

  updateCoverSheet({coverSheet}) {
    return this.get('api').httpPost({
      path: 'apis.coverSheet.save',
      data: coverSheet,
    });
  },

  updateAwardeeOrg({propPrepId, propRevId, coverSheetId, selectedNewAwardeeOrg}) {
    return this.get('api').httpPost({
      path: 'apis.coverSheet.updateAwardeeOrg',
      data: selectedNewAwardeeOrg,
      parameters: [propPrepId, propRevId, coverSheetId]
    });
  }


});
