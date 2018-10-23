import Service from '@ember/service';
import { inject as service } from '@ember/service';

const PI_ROLE_CODE = '01';

export default Service.extend({
  api: service('api'),

  getAllPersonnel({propPrepId, propRevId}) {
    return this.get('api').httpGet('apis.personnel.getPersonnel', propPrepId, propRevId);
  },

  getOtherSeniorPersonnelByNSFId({nSFId}) {
    return this.get('api').httpGet('apis.personnel.searchOtherSeniorPersonnel', nSFId);
  },

  getOtherSeniorPersonnelByEmail({email}) {
    return this.get('api').httpGet('apis.personnel.searchOtherSeniorPersonnelEmail', email);
  },

  getPersonnel({propPrepId, propRevId, personnelId}) {
    return this.get('api').httpGet('apis.personnel.getSinglePersonnel', propPrepId, propRevId, personnelId);
  },

  getPersonnelByEmail({email, roleCode}) {
    return this.get('api').httpGet('apis.personnel.searchPersonnelEmail', email, roleCode);
  },

  getPersonnelById({nSFId, roleCode}) {
    return this.get('api').httpGet('apis.personnel.searchPersonnel', nSFId, roleCode);
  },

  getSeniorPersonnelRoles() {
    return this.get('api').httpGet('apis.personnel.lookupSeniorPersonRoleCode');
  },

  getOtherPersonnelRoles() {
    return this.get('api').httpGet('apis.personnel.lookupOtherPersonTypeCode');
  },

  replacePI({ propPrepId, propRevId, pIPersonnelId, newPIPersonnelId }) {
    return this.get('api').httpPost({
      path: 'apis.personnel.removePI',
      parameters: [propPrepId, propRevId, pIPersonnelId, newPIPersonnelId, PI_ROLE_CODE]
    });
  },

  removePersonnel({ propPrepId, propRevId, personnelId }) {
    return this.get('api').httpDelete({
      path: 'apis.personnel.removePersonnel',
      parameters: [propPrepId, propRevId, personnelId]
    });
  },

  savePersonnel(personnelData) {
    return this.get('api').httpPost({
      path: 'apis.personnel.savePersonnel',
      data: personnelData
    });
  },
});
