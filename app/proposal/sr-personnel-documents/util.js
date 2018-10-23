/* This helper function is called in afterModel hook of Sr Personnel Documents child routes
   i.e updatePageTitleAfterModel.call(this, model, transition);

   This is so the page title is updated to include the full name in page title after payload
   (model) has loaded.
*/
import { isBlank } from '@ember/utils';

function getFullNameByPerson(person) {
  const names = ['firstName', 'middleName', 'lastName'];
  const name = names.reduce((accum, currentValue) => {
    const currentName = person[currentValue];
    const space = (accum !== '') ? ' ' : '';
    if (!isBlank(currentName)) {
      const concatedName = accum + space + currentName;
      return concatedName;
    }
    return accum;
  }, '');

  return name;
}

function updatePageTitleAfterModel(model, transition) {
  const person = model.personnel.personnel;
  const name = getFullNameByPerson(person);
  const controller = this.controllerFor(transition.targetName);
  this.get('pageInfo').setPageInfo({
    title: `${controller.get('sectionName')} - ${name}`
  })
}

export {
  getFullNameByPerson,
  updatePageTitleAfterModel
}
