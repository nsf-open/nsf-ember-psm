

const PROPOSAL_STRING_CONSTANTS = {
  UPLOAD_DOCUMENT: {
    ALL_TEXT_MUST_USE_FONT: '(Currently, all text in the document, including tables, figures, captions and charts, must use Times New Roman and/or Symbol font type with a font size of 11 or larger).'.replace(/(.*)/, '<b>$1</b>'),
    SHOULD_NOT_PAGE_NUMBER: 'Your document should not contain page numbers, as they will be added automatically by the system.'.replace(/not/g, '<b>not</b>')
  },
  PROPOSAL_SUMMARY: {
    SHOULD_BE_INFORMATIVE: 'The Project Summary should be informative to other persons working in the same or related fields, and, insofar as possible, understandable to a broad audience within the scientific domain. It should not be an abstract of the proposal.'
  },
  PROPOSAL_UPDATE_JUST: {
    INSTRUCTIONS: 'Please provide a justification for the requested proposal updates and include a description of the requested changes. Please note that any formatting of your request will not be saved.'
  },

  SYSTEM_ERROR: {
    ACCESS_CHANGE: 'The system has encountered an error and was unable to save the proposal access change.',
    ADD_PERSONNEL: 'An unexpected error has occurred, and the system could not add the personnel to this $helpDeskPhone proposal. We apologize for the inconvenience. Please try again, and if you still experience difficulties, contact the help desk at $helpDeskPhone or $helpDeskEmail.',
    CREATE_REVISION: 'The system has encountered an error and was unable to create a revision.',
    COVER_SHEET: 'The system has encountered an error and was unable to save the cover sheet.',
    DEADLINE_DATE: 'The system has encountered an error and was unable to update the proposal deadline date.',
    FILE_UPLOAD: 'The system has encountered an error and was unable to upload your file.',
    ENCOUNTERED: 'The system has encountered an error.',
    PROPOSAL_JUSTIFICATION: 'The system has encountered an error and was unable to save the proposal update justification.',
    REMOVE_SELECTED_PERSONNEL: 'The system has encountered an error and was unable to remove the selected person.',
    RETRIEVE_PERSONNEL: 'The system has encountered an error and was unable to retrieve personnel for this proposal.',
    RETURNED_TO_PI: 'The system has encountered an error and was unable to return to PI.',
    SAVE_BUDGET: 'The system has encountered an error and was unable to save the budget.',
    SEARCH_PERSONNEL: 'The system has encountered an error and was unable to search for personnel.',
    TRY_AGAIN: 'Please try again and if this issue persists, you may contact the Help Desk at $helpDeskPhone or $helpDeskEmail.'
  },

  WITHDRAWAL_MODAL: {
    TITLE: 'Withdrawals',
    DESCRIPTION: 'Withdrawals are not yet available in Research.gov. If a withdrawal is needed on a proposal prepared in Research.gov, please contact the NSF Help Desk at $helpDeskPhone or $helpDeskEmail.'
  }
};

const SYSTEM_ERROR = PROPOSAL_STRING_CONSTANTS.SYSTEM_ERROR;
const TRY_AGAIN = 'TRY_AGAIN', ADD_PERSONNEL = 'ADD_PERSONNEL';
const phoneEmailKeys = [TRY_AGAIN, ADD_PERSONNEL];

Object.keys(SYSTEM_ERROR).forEach((key) => {
  if (phoneEmailKeys.indexOf(key) !== -1) return;

  SYSTEM_ERROR[key] = `${SYSTEM_ERROR[key]} ${SYSTEM_ERROR.TRY_AGAIN}`;
});


export default PROPOSAL_STRING_CONSTANTS;
