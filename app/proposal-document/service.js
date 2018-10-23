import Service from '@ember/service';
import { inject as service } from '@ember/service';

import $ from 'jquery';

const messageStatuses = ['ERROR', 'WARNING', 'INFORMATION'];
const [ERROR, WARNING, INFORMATION]= messageStatuses;

function getDocumentParameters({propPrepId, propRevId, personnelId, sectionCode, previewRequired}) {
  let parameters;

  if(personnelId === undefined) {
    parameters = [propPrepId, propRevId, sectionCode];
  }
  else if (previewRequired) {
    parameters = [propPrepId, propRevId, personnelId];
  }
  else {
    parameters = [propPrepId, propRevId, sectionCode, personnelId];
  }

  return parameters;
}


function formatMessages(inputMessages) {
  const messages = inputMessages.map((responseMessage) => {
    let dismissable, status, statusCode;
    if (responseMessage.type == ERROR) {
      status = 'error';
      statusCode = ERROR;
      dismissable = false;
    }
    else if (responseMessage.type == WARNING) {
      status = 'warning';
      statusCode = WARNING;
      dismissable = false;
    }
    else {
      status = 'success';
      statusCode = INFORMATION;
      dismissable = true;
    }

    const message = {status, statusCode, dismissable, message: responseMessage.description};

    return message;
  });

  return messages;
}

const compose = (...fns) => fns.reduce((f, g) => (...args) => f(g(...args)));

function messageContainStatus(statusContainsFunc) {
  return (messages) => {
    return messages.some(statusContainsFunc)
  }
}

function messageFilterStatus(statusContainsFunc) {
  return (messages) => {
    return messages.filter(statusContainsFunc)
  }
}

function statusCodeEquals(statusCode) {
  return (message)  => {
    return message.statusCode === statusCode;
  }
}

function messageContainStatuses(messageStatuses) {
  return (message) => {
    return messageStatuses.indexOf(message.type) !== -1;
  }
}

const messagesContainsError = compose(messageContainStatus, statusCodeEquals)(ERROR);
const messagesContainsSuccess = compose(messageContainStatus, statusCodeEquals)(INFORMATION);
const messagesFilterError = compose(messageFilterStatus, statusCodeEquals)(ERROR);
const messagesFilterAllStatuses = compose(messageFilterStatus, messageContainStatuses)(messageStatuses);


export default Service.extend({
  activeUser: service('active-user'),
  api: service('api'),
  PROPOSAL_CONSTANTS: service('proposal-constants'),
  props: service('properties'),

  init(...args) {
    this._super(...args);

    this.set('messageTexts', {
      fail_generic: this.get('PROPOSAL_CONSTANTS').SYSTEM_ERROR.FILE_UPLOAD,
      success_upload: 'Your file has been uploaded successfully.'
    });
  },

  deleteDocument({apiPath, propPrepId, propRevId, personnelId,
    sectionCode, previewRequired}) {
    const parameters = getDocumentParameters({propPrepId, propRevId, personnelId,
      sectionCode, previewRequired});
    return this.get('api').httpDelete({path: `${apiPath}.fileDelete`, parameters});
  },

  getFileInfo({apiPath, propPrepId, propRevId, personnelId, sectionCode, previewRequired}) {
    const parameters = getDocumentParameters({propPrepId, propRevId, personnelId,
      sectionCode, previewRequired});
    return this.get('api').httpGet(`${apiPath}.fileGet`, ...parameters);
  },

  uploadDocument({apiPath, previewAccepted, fileObject, propPrepId,
    propRevId, personnelId, institutionId, sectionCode, previewRequired}) {

    const genericErrorMessage = {status: 'error', dismissable: false,
      message: this.get('messageTexts.fail_generic')};
    const genericSuccessMessage = {status: 'success', dismissable: true,
      message: this.get('messageTexts.success_upload')};

    // Create a FormData object and append the file
    const formData = new FormData();
    formData.append('uploadedFile', fileObject, fileObject.name);

    let variableReplace;

    if (previewRequired) {
      variableReplace = [propPrepId, propRevId, personnelId];
    }
    else if (personnelId !== undefined) {
      variableReplace = [propPrepId, propRevId, sectionCode, personnelId];
    }
    else {
      variableReplace = [propPrepId, propRevId, sectionCode, institutionId];
    }

    return new Promise((resolve, reject) => {

      // use preview url if applicable otherwise use usual upload url
      let urlForUpload = '';
      if (previewRequired && !previewAccepted) {
        urlForUpload = this.get('props').getReplace(`${apiPath}.filePreview`);
      }
      else {
        urlForUpload = this.get('props').getReplace(`${apiPath}.fileUpload`, variableReplace);
      }

      const xhr = new XMLHttpRequest();
      xhr.open('POST', urlForUpload);


      if (this.get('activeUser').getToken()) {
        xhr.setRequestHeader('Authorization', `Bearer ${this.get('activeUser').getToken()}`);
        xhr.setRequestHeader('nsfId', this.get('activeUser').getNSFID());
      }
      else {
        // @TODO: cannot set access token, error handling? log out the user?
      }

      xhr.onload = (oEvent) => {

        if (xhr.status == 200) {
          // show report results if available
          if (oEvent.target.response && oEvent.target.response) {
            const responseJSON = $.parseJSON(oEvent.target.response);

            // If file upload requires user to accept/reject first, display this info in a modal
            if (previewRequired && !previewAccepted) {
              // Show modal with data and accept/reject buttons
              if (responseJSON.spreadsheetModel) {
                resolve({spreadSheetModel: responseJSON.spreadsheetModel });
              }

              return;
            }

            if (responseJSON.messages) {
              const responseMesssages = messagesFilterAllStatuses(responseJSON.messages);
              const messages = formatMessages(responseMesssages);
              const errorFound = messagesContainsError(messages);
              const containsSuccessMesssage = messagesContainsSuccess(messages);

              if(errorFound) {
                reject({messages});
              }
              else { // compliant
                if(!containsSuccessMesssage) messages.push(genericSuccessMessage);
                resolve({messages });
              }
            }
          }
        }
        // show report results if available
        else if (oEvent.target && oEvent.target.response) {
          try {
            const responseJSON = $.parseJSON(oEvent.target.response);

            if (responseJSON && responseJSON.messages) {
              const messages = formatMessages(responseJSON.messages);
              const errorMessages = messagesFilterError(messages)

              reject({messages: errorMessages});
            }
            else {
              reject({messages: [genericErrorMessage]});
            }
          }
          catch (e) {
            reject({messages: [genericErrorMessage]});
          }
        }
        else {
          reject({messages: [genericErrorMessage]});
        }
      };

      xhr.onerror = () => {
        reject({messages: [genericErrorMessage]});
      };

      xhr.send(formData);
    });
  }
});
