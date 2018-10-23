import Service from '@ember/service';
import { inject as service } from '@ember/service';

export default Service.extend({
  api: service('api'),
  _currentUser: null,
  token: null,

  getActiveUser() {
    const token = this.getToken();
    return this.get('api').httpGet('apis.userData.userDataGet', token);
  },

  getCurrentUser() {
    return this.get('_currentUser');
  },

  setCurrentUser(user) {
    this.set('_currentUser', user);
  },

  getCurrentUserDisplayName() {
    const user = this.get('_currentUser');
    if (user && user.UserData) {
      let userDisplayName = '';
      if (user.UserData.firstName && user.UserData.lastName) {
        userDisplayName = `${user.UserData.firstName} ${user.UserData.lastName}`;
      }
      else if (user.UserData.lastName) {
        userDisplayName = user.UserData.lastName;
      }
      else if (user.UserData.firstName) {
        userDisplayName = user.UserData.firstName;
      }
      return userDisplayName;
    }
    return '';
  },

  getToken() {
    if (this.get('token')) {
      return this.get('token');
    }
    return '';
    // Return a token here for localhost access
    // return "b70b7356-868d-42a1-8204-8297ebfd171a";
  },

  setToken(token) {
    this.set('token', token);
  },

  getNSFID() {
    const user = this.get('_currentUser');
    if (user && user.UserData) {
      return user.UserData.nsfId;
    }
    return '';
  },

  setNSFID(nsfId) {
    if (this.get('_currentUser')) {
      if (this.get('_currentUser').UserData) {
        this.set('_currentUser.UserData.nsfId', nsfId);
      }
      else {
        this.set('_currentUser.UserData', {});
        this.set('_currentUser.UserData.nsfId', nsfId);
      }
    }
  }

});
