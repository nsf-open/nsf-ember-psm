import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { alias } from '@ember/object/computed';
import { computed } from '@ember/object';


export default Controller.extend({
  customForm: service(),
  messageService: service('messages'),
  proposalDocumentService: service('proposal-document'),
  props: service('properties'),
  transitionService: service('transition'),

  apiPath: 'apis.fileUpload',
  currentFileData: '',
  enableFrontEndValidations: true, // Enable/Disable front-end validations for PCV testing purposes
  previewRequired: false,
  fileName: '',
  isError: false,
  isDocumentLoading: false,
  maxFileNameCharacters: 254,
  maxFileSize: 10000000, // validate < 10MB
  previewAccepted: false,
  isPreviewMode: false,
  proposalDetails: alias('model'),
  selectedFilePath: '',
  spreadSheetModelData: null,

  init(...args) {
    this._super(...args);
    this.set('allowableFileTypes', this.get('allowableFileTypes') || ['.pdf']); // validate only pdf

    this.set('messageTexts', {
      fail_filetype:  `Your file is an invalid file type. Only ${this.get('allowableFileTypesAccept')} documents are permitted.`,
      fail_filesize: `Your file exceeds the maximum file size of ${this.get('maxFileSizeDisplay')}.`,
      fail_filename: `Your file has a filename that exceeds the maximum of ${this.get('maxFileNameCharacters')} characters.`
    });
  },

  fileError({errorType}) {
    const messageText = this.get(`messageTexts.${errorType}`);
    const message = {status: 'error', dismissable: false, message: messageText};
    this.get('messageService').addMessage(message);
    this.set('isError', true);
  },

  getFileName(proposalDetails) {
    const sectionInfo = this.get('sectionInfo');
    const sectionCamelCaseName = sectionInfo.camelCaseName;
    const { personnelId, propPrepId, propRevId } = proposalDetails;
    const sectionCode = sectionInfo.code;
    const apiPath = this.get('apiPath');
    const previewRequired = !!this.get('previewRequired');

    return this.get('proposalDocumentService').getFileInfo({ apiPath, personnelId, propPrepId, propRevId, sectionCode, previewRequired }).then((data) => {
        if (data && data[sectionCamelCaseName] && data[sectionCamelCaseName].origFileName && data[sectionCamelCaseName].origFileName != ' ') {
          this.set('fileName', data[sectionCamelCaseName].origFileName);
        }
        else {
          this.set('fileName', '');
        }
        if (data && data.messages && data.messages.length && data.messages.length !== 0) {
          for (let i = 0; i < data.messages.length; i += 1) {
            if (data.messages[i].type === 'ERROR') {
              const message = {status: 'error', dismissable: false, message: data.messages[i].description};
              this.get('messageService').addMessage(message);
            }
            else if (data.messages[i].type === 'WARNING') {
              const message = {status: 'warning', dismissable: true, message: data.messages[i].description};

              this.get('messageService').addMessage(message);
            }
            else if (data.messages[i].type === 'INFO') {
              const message = {status: 'info', dismissable: true, message: data.messages[i].description};
              this.get('messageService').addMessage(message);
            }
          }
        }
      }, () => {
      });
  },

  setSectionInfo(sectionObject) {
    const sectionKey = this.get('sectionKey');
    const sectionInfo = sectionObject[sectionKey];
    this.set('sectionInfo', sectionInfo);
  },

  allowableFileTypesAccept: computed('allowableFileTypes', function() {
    return this.get('allowableFileTypes').join().replace('.', '').toUpperCase();
  }),

  currentFileHref: computed('fileName', function() {
    if (this.get('fileName')) {
      let variableReplace = [this.get('proposalDetails').propPrepId, this.get('proposalDetails').propRevId, this.get('sectionInfo').code];

      if (this.get('proposalDetails').personnelId !== undefined) {
        if (this.get('previewRequired')) {
          variableReplace = [this.get('proposalDetails').propPrepId, this.get('proposalDetails').propRevId, this.get('proposalDetails').personnelId];
        }
        else {
          variableReplace = [this.get('proposalDetails').propPrepId, this.get('proposalDetails').propRevId, this.get('sectionInfo').code, this.get('proposalDetails').personnelId];
        }
      }

      const apiPath = this.get('apiPath');
      const urlForViewFile = this.get('props').getReplace(`${apiPath}.fileView`, variableReplace);

      return urlForViewFile;
    }
    else {
      return '';
    }
  }),

  maxFileSizeDisplay: computed('maxFileSize', function() {
    return `${this.get('maxFileSize') / 1000000}MB`;
  }),

  actions: {

    fileBrowseClick() {
      this.get('messageService').clearActionMessages();
      this.set('isError', false);
    },

    fileLinkClick() {
      const fileUrl = this.get('currentFileHref');
      this.get('customForm').postUrlUserToken(fileUrl);
    },

    deleteFile() {
      this.set('isDocumentLoading', true);
      this.get('messageService').clearActionMessages();
      const {propPrepId, propRevId, personnelId} = this.get('proposalDetails');
      const sectionCode = this.get('sectionInfo').code;
      const previewRequired = this.get('previewRequired');
      const apiPath = this.get('apiPath');

      this.get('proposalDocumentService').deleteDocument({apiPath, propPrepId, propRevId,
        personnelId, sectionCode, previewRequired}).then((data) => {
        // clear current file info
        this.set('fileName', '');
        this.set('selectedDocumentPath', '');

        if (data && data.messages && data.messages[0] && data.messages[0].description) {
          if (data.messages[0].type == 'ERROR') {
            const message = {status: 'error', dismissable: false, message: data.messages[0].description};
            this.get('messageService').addMessage(message);
          }
          else {
            const message = {status: 'success', dismissable: true, message: data.messages[0].description};
            this.get('messageService').addMessage(message);
          }
        }
        else {
          const message = {status: 'success', dismissable: true, message: this.get('messageTexts.success_delete')};
          this.get('messageService').addMessage(message);
        }
      }, (data) => {

        if (data && data.messages && data.messages[0] && data.messages[0].description) {
          const message = {status: 'error', dismissable: false, message: data.messages[0].description};
          this.get('messageService').addMessage(message);
        }
        else {
          const message = {status: 'error', dismissable: false, message: this.get('messageTexts.fail_generic')};
          this.get('messageService').addMessage(message);
        }
      }).then(() => {
        this.set('isDocumentLoading', false);
      });
    },

    uploadFile({previewAccepted, fileObject}) {

      if (this.get('enableFrontEndValidations')) {
        // Validation for allowable file types
        let isFileExtensionValid = false;
        for (let i = 0; i < this.get('allowableFileTypes').length; i += 1) {
          if (fileObject.name.toLowerCase().endsWith(this.get('allowableFileTypes')[i])) {
            isFileExtensionValid = true;
          }
        }

        if (!isFileExtensionValid) {
          this.set('fileName', '');
          this.fileError({errorType: 'fail_filetype'});
          return false;
        }
        // Validation for max file size
        if (fileObject.size > this.get('maxFileSize')) {
          this.set('fileName', '');
          this.fileError({errorType: 'fail_filesize'});
          return false;
        }
        // Validation for max filename length
        if (fileObject.name.length > this.get('maxFileNameCharacters')) {
          this.set('fileName', '');
          this.fileError({errorType: 'fail_filename'});
          return false;
        }
      }

      // Set pendingFileName property, if converting after upload then change to converted extension
      let tempFileName = fileObject.name;
      if (this.get('previewRequired') && this.get('convertedFileType')) {
        tempFileName = tempFileName.substring(0, tempFileName.lastIndexOf('.')) + this.get('convertedFileType');
      }

      this.set('pendingFileName', tempFileName);
      this.get('messageService').clearActionMessages();
      this.get('transitionService').setAjaxInProgress(true);
      this.set('isDocumentLoading', true);
      this.set('selectedDocumentPath', fileObject.name);
      this.set('isError', false);

      const apiPath = this.get('apiPath');
      const {propPrepId, propRevId, personnelId, institutionId} = this.get('proposalDetails');
      const sectionCode = this.get('sectionInfo').code;
      const previewRequired = !!this.get('previewRequired');

      if(previewRequired) this.set('isPreviewMode', true); // before a request begins for preview-required requests
                                                           // toggle preview mode

      this.get('proposalDocumentService').uploadDocument({apiPath, previewAccepted, fileObject, propPrepId,
        propRevId, personnelId, institutionId, sectionCode, previewRequired}).then(({messages, spreadSheetModel}) => {

          if (messages !== undefined) {
            this.get('messageService').addAllMessages(messages);
          }

          if (previewRequired) {
            this.set('fileName', fileObject.name.replace('.xlsx', '.pdf'));

          }
          else {
            this.set('fileName', fileObject.name);
          }

          if (spreadSheetModel !== undefined) {
            this.set('spreadSheetModelData', spreadSheetModel);
          }

        }, ({messages: errorMessages}) => {
          this.get('messageService').addAllMessages(errorMessages);

          this.setProperties({
            fileName: '',
            isError: true,
            spreadSheetModelData: null
          });
        }).then(() => {
          this.set('pendingFileName', '');
          this.get('transitionService').setAjaxInProgress(false);
          this.set('isDocumentLoading', false);

          if(previewAccepted) {
            this.set('isPreviewMode', false); // after the request when preview was accepted toggle off preview mode
            this.set('previewAccepted', false); // also toggle off preview accepted flag
          }
        })
    }
  }
});
