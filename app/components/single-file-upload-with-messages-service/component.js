import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import { isEmpty } from '@ember/utils';
import $ from 'jquery';

/**
   * Upload API may return data to be displayed then accepted/rejected. This method parses one such data set
   * into html to be displayed in the modal
   * @param spreadsheetModel
   * @returns {string}
   */
function parseSpreadsheetModel(spreadsheetModel) {
  let htmlToReturn = '';
  const tables = spreadsheetModel.worksheets[0].tables;

  for (let i = 0; i < tables.length; i += 1) {
    htmlToReturn += "<table class='table table-striped'>";

    const rows = tables[i].rows;
    for (let j = 0; j < rows.length; j += 1) {
      const cells = rows[j].cells;
      if (j == 0) { // subheader row
        htmlToReturn += `<thead><tr><th colspan='${cells.length}'>${tables[i].name}`;
        if (i == 0) {
          htmlToReturn += `<span class='right'>${rows.length - 1}${rows.length > 2 ? ' organizational affiliations' : ' organizational affiliation'}</span>`;
        }
        else {
          htmlToReturn += `<span class='right'>${rows.length - 1}${rows.length > 2 ? ' personnel' : ' person'}</span>`;
        }
        htmlToReturn += '</th></tr></thead>';
        htmlToReturn += "<thead><tr class='sub-header'>";
        for (let q = 0; q < cells.length; q += 1) {
          htmlToReturn += `<th>${cells[q].value}</th>`;
        }
        htmlToReturn += '</tr></thead>'
      }
      else { // regular row
        htmlToReturn += '<tr>';
        for (let q = 0; q < cells.length; q += 1) {
          // htmlToReturn += "<td class='word-break-all word-wrap'>"+cells[q].value+"</td>";
          htmlToReturn += `<td>${cells[q].value}</td>`;
        }
        htmlToReturn += '</tr>';
      }
    }

    htmlToReturn += '</table>';
  }

  return htmlToReturn;
}


export default Component.extend({
  activeUser: service('active-user'),
  permissions: service('permissions'),
  PROPOSAL_CONSTANTS: service('proposal-constants'),
  props: service('properties'),

  currentFileName: '',
  currentSpreadSheetModelData: null,
  isPreviewMode: false,
  previewTableHTML: '',

  uploadingText: 'Uploading.  Please wait...',

  init(...args) {
    this._super(...args);

    // set default to ['.pdf'] if none are specified
    this.set('allowableFileTypes', this.get('allowableFileTypes') || ['.pdf']);

    this.set('messageTexts', {
        'success_upload': 'Your file has been uploaded successfully.',
        'fail_compliance': 'Your file is not compliant.',
        'fail_timeout': 'Your file upload timed out.',
        'fail_generic': this.get('PROPOSAL_CONSTANTS').SYSTEM_ERROR.FILE_UPLOAD,
        'success_delete': 'Your file has been deleted successfully.',
        'fail_delete': 'Your file did not delete.'
    });
  },

  didReceiveAttrs() {
    this._super(...arguments);

    const spreadSheetModelData = this.get('spreadSheetModelData');
    const currentFileName = this.get('currentFileName');
    const currentSpreadSheetModelData = this.get('currentSpreadSheetModelData');
    const fileName = this.get('fileName');
    const isError = this.get('isError');

    if(currentSpreadSheetModelData !== spreadSheetModelData) {
      const newPreviewTableHTML = spreadSheetModelData ? parseSpreadsheetModel(spreadSheetModelData) : null;
      this.set('previewTableHTML', newPreviewTableHTML);
      this.set('currentSpreadSheetModelData', spreadSheetModelData);
    }

    if(this.get('currentSpreadSheetModelData') && currentSpreadSheetModelData !== spreadSheetModelData) {
      $('#acceptFileModal').modal('show');
      $('#acceptFileModal .modal-body').scrollTop(0);
    }

    if(fileName !== currentFileName) {
      if(!fileName) $('#fileInput').val('');

      this.set('currentFileName', fileName);
    }

    if(isError) {
      $('#acceptFileModal').modal('hide');
      $('#acceptFileModal .modal-body').scrollTop(0);
      $('#fileInput').val('');
    }
  },

  pendingFileName: '',

  printTitleText: computed('currentFileName', function() {
    if (this.get('currentFileName')) {
      return 'opens in a new window';
    }
    else {
      return 'A file must be uploaded before the it can be previewed/printed';
    }
  }),
  complianceTitleText: computed('currentFileName', function() {
    if (this.get('currentFileName')) {
      return '';
    }
    else {
      return 'A file must be uploaded before compliance can be checked';
    }
  }),

  previewSectionInstruction: 'Please review the information, and if displayed properly, upload your file.'
    + ' Otherwise, cancel and revise your file before uploading again.',

  previewSectionName: computed('sectionInfo', function() {
    const sectionInfo = this.get('sectionInfo');

    if (sectionInfo && sectionInfo.name) {
      return sectionInfo.name;
    }

    return '';
  }),

  currentFileNameEmpty: computed('currentFileName', function() {
    return isEmpty(this.get('currentFileName'));
  }),

  browseTitleText: computed('currentFileName', function() {
    if (this.get('currentFileName')) {
      return 'Only one file can be uploaded. To replace the file, delete it, then browse for a new file.';
    }
    else if (this.get('pendingFileName')) {
      return 'A file upload is already in progress';
    }
    else {
      return '';
    }
  }),

  fileIcon: computed('currentFileName', function() {
    const fileName = this.get('currentFileName').toLowerCase();
    if (fileName.endsWith('pdf')) {
      return 'fa-file-pdf-o';
    }
    else if (fileName.endsWith('doc') || fileName.endsWith('docx')) {
      return 'fa-file-word-o';
    }
    else if (fileName.endsWith('xls') || fileName.endsWith('xlsx')) {
      return 'fa-file-excel-o';
    }
    else if (fileName.endsWith('txt')) {
      return 'fa-file-text-o';
    }
    else if (fileName.endsWith('png') || fileName.endsWith('jpg')) {
      return 'fa-file-image-o';
    }
    return 'fa-file';
  }),

  pendingFileIcon: computed('pendingFileName', function() {
    const fileName = this.get('pendingFileName').toLowerCase();
    if (fileName.endsWith('pdf')) {
      return 'fa-file-pdf-o';
    }
    else if (fileName.endsWith('doc') || fileName.endsWith('docx')) {
      return 'fa-file-word-o';
    }
    else if (fileName.endsWith('xls') || fileName.endsWith('xlsx')) {
      return 'fa-file-excel-o';
    }
    else if (fileName.endsWith('txt')) {
      return 'fa-file-text-o';
    }
    else if (fileName.endsWith('png') || fileName.endsWith('jpg')) {
      return 'fa-file-image-o';
    }
    return 'fa-file';
  }),

  actions: {
    acceptFile() {
      $('#acceptFileModal').modal('hide');
      const previewAccepted = true;
      this.set('previewAccepted', true);
      this.send('browseForFileChange', $('#fileInput').prop('files'), previewAccepted);
    },

    browseForFile() {
      this.get('onFileBrowseClick')();
      $('#fileInput').click();
    },

    browseForFileChange(files, previewAccepted) {
      const fileObject = files[0];

      // make sure file exists in <input>, IE will trigger this method after a file delete
      if (fileObject == null || fileObject == undefined) {
        return;
      }

      this.get('onFileChange')({previewAccepted, fileObject})
    },

    deleteFile() {
      this.get('onDelete')();
    },

    fileLinkClick() {
      this.get('onFileClick')();
    },

    openFile() {
      document.fileOpenForm.submit();
    },

    rejectFile() {
      // Clear current file info so it resets and can click browse again
      this.set('currentFileName', '');
      $('#fileInput').val('');
      $('#acceptFileModal').modal('hide');
    }
  }

});
