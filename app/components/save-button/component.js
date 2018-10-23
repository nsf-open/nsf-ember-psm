import Component from '@ember/component';
import { computed } from '@ember/object';

/* setButtonToLoadingWidth takes in the element of the component
 * and the loading text string. Clones the button in the component
 * element, emulates what the button element will look like with the
 * loading text. Then the element button is appended to the document
 * so the offsetWidth value of the button is obtainable, sets the
 * the inline width property of the actual button element with this
 * offsetWidth value, then the cloned button is removed */
function setButtonToLoadingWidth({ element, loadingText }) {
  const saveButton = element.querySelector('.save-button');
  const clonedSavedButton = saveButton.cloneNode();
  clonedSavedButton.innerHTML = `<span class="fa fa-spinner fa-spin"></span>&nbsp;<span>${loadingText}</span>`;
  clonedSavedButton.style.position = 'absolute';
  clonedSavedButton.style.top = '0px';
  clonedSavedButton.style.visibility = 'hidden';
  document.body.appendChild(clonedSavedButton);

  const loadingWidth = clonedSavedButton.offsetWidth;
  saveButton.style.width = `${loadingWidth}px`;
  clonedSavedButton.parentNode.removeChild(clonedSavedButton);
}

export default Component.extend({
  tagName: 'span',

  btnClass: 'default',
  disabled: false,
  isLoading: false,
  loadingText: 'Saving',
  title: '',

  didInsertElement(...args) {
    this._super(...args);

    setButtonToLoadingWidth({ element: this.get('element'), loadingText: this.get('loadingTextFormatted') });
  },


  loadingTextFormatted: computed('loadingText', function() {
    return `${this.get('loadingText')}...`;
  }),

  // This computed property will be used to disable the save button if
  // the disabled input property is true or if the button is in loading state
  disableButton: computed('disabled', 'isLoading', function() {
    return this.get('disabled') || this.get('isLoading');
  }),

  btnCSSValue: computed('btnClass', function() {
    return `save-button btn btn-${this.get('btnClass')}`;
  }),

  actions: {
    onClick() {
      this.get('onClick')();
    }
  }
});
