import Service from '@ember/service';
import { inject as service } from '@ember/service';
import { request as ajax } from 'ic-ajax';

function getAjaxObj(path, parameters) {
  return {
    url: this.get('props').getReplace(path, parameters),
    contentType: 'application/json',
    beforeSend: (xhr) => {
      if (this.get('activeUser').getToken()) {
        xhr.setRequestHeader('Authorization', `Bearer ${this.get('activeUser').getToken()}`);
        xhr.setRequestHeader('nsfId', this.get('activeUser').getNSFID());
      }
      else {
        // @TODO: cannot set access token, error handling? log out the user?
      }
    }
  }
}

export default Service.extend({
  activeUser: service('active-user'),
  props: service('properties'),

  httpDelete({path, parameters}) {
    return this.httpRequest({
      path,
      parameters,
      options: {
        type: 'DELETE'
      }
    });
  },

  httpGet(path, ...parameters) {
    return this.httpRequest({
      path,
      parameters,
      options: {
        type: 'GET',
        cache: false,
      }
    });
  },

  httpPost({path, data, parameters}) {
    return this.httpRequest({
      path,
      parameters,
      options: {
        type: 'POST',
        data: JSON.stringify(data),
        dataType: 'json'
      }
    });
  },

  httpRequest({ path, parameters, options }) {
    const ajaxObj = getAjaxObj.call(this, path, parameters);
    return ajax(Object.assign(ajaxObj, options));
  }
});

