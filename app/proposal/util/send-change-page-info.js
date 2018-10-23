function sendChangePageInfoAction(argObj) {
  this.controllerFor('proposal').send('changePageInfo', argObj);
}

export {
  sendChangePageInfoAction
}
