import EmberObject from '@ember/object';

import { enumeration } from '../utils';

const API_PREFIX = 'apis';
const DEFAULT_PATH = 'fileUpload';

const proposalDocumentData = {
  BUDGET_IMPACT_STATEMENT: {
  },
  BUDGET_JUSTIFICATION: {
  },
  DATA_MANAGEMENT_PLAN: {
  },
  FACILITIES_EQUIPMENT: {
  },
  OTHER_PERSONNEL_BIO_INFO: {
  },
  OTHER_SUPPLEMENTARY_DOCS: {
  },
  POSTDOC_MENTORING_PLAN: {
  },
  PROJECT_DESCRIPTION: {
  },
  PROJECT_SUMMARY: {
  },
  REFERENCES_CITED: {
  },
  REVIEWERS_NOT_INCLUDED: {
  },
  SR_PERSONNEL_DOCUMENTS_BIO_SKETCH: {
    apiPath: 'personnelDocumentsUpload'
  },
  SR_PERSONNEL_DOCUMENTS_COLLABORATORS: {
    apiPath: 'personnelDocumentsUploadCOA',
    previewRequired: true
  },
  SR_PERSONNEL_DOCUMENTS_SUPPORT: {
    apiPath: 'personnelDocumentsUpload'
  },
  SUGGESTED_REVIEWERS: {
  }
};



const ProposalDocument = EmberObject.extend({
  init() {
    this.apiPath = `${API_PREFIX}.${(this.apiPath || DEFAULT_PATH)}`;
    this.previewRequired = (this.previewRequired !== undefined) ? this.previewRequired : false;
  }
});

const enumData = Object.keys(proposalDocumentData).reduce((accum, proposalDocumentKey) => {
  const proposalDocumentData = proposalDocumentData[proposalDocumentKey];
  accum[proposalDocumentKey] = ProposalDocument.create(proposalDocumentData);
  return accum;
}, {});

const ProposalDocuments = enumeration(enumData);

export {
  ProposalDocuments
}
