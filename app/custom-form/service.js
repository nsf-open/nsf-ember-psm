import Service from '@ember/service';
import { inject as service } from '@ember/service';

export default Service.extend({
  activeUser: service(),

  postTo(url, ...inputs) {
    const form = document.createElement('form');
    form.setAttribute('method', 'post');
    form.setAttribute('action', url);
    form.setAttribute('target', '_blank');

    for (let i = 0; i < inputs.length; i += 1) {
      const input = inputs[i];
      const inputField = document.createElement('input');
      inputField.setAttribute('type', 'hidden');
      inputField.setAttribute('name', input.name);
      inputField.setAttribute('value', input.value);
      form.appendChild(inputField);
    }

    document.documentElement.appendChild(form);
    form.submit();
  },
  postUrlUserToken(url) {
    const tokenValue = this.get('activeUser').getToken();
    const tokenInput = { name: 'token', value: tokenValue };
    this.postTo(url, tokenInput);
  }
});
