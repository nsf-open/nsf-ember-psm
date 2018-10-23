import Service from '@ember/service';

import { PROPOSAL_STRING_CONSTANTS } from '../proposal/util';

function replaceItems(obj, replaceMap) {
  const keys = Object.keys(obj);
  const replaceKeys = Object.keys(replaceMap);

  const newObj = keys.reduce((accum, key) => {
    let value = obj[key];

    if (typeof value === 'string') {
      // - Replace values from the replace map
      replaceKeys.forEach((replaceKey) => {
        const replaceValue = replaceMap[replaceKey];
        const re = new RegExp(`\\$${replaceKey}`, 'g');
        value = value.replace(re, replaceValue);
      });
    }
    else if (typeof value === 'object') {
      value = replaceItems(value, replaceMap);
    }

    accum[key] = value
    return accum;
  }, {});

  return newObj;
}

export default Service.extend({
  init(...args) {
    this._super(...args);

    const replaceMap = {
      'helpDeskPhone': '1-800-381-1532',
      'helpDeskEmail': 'Rgov@nsf.gov'
    };

    const proposalStrings = replaceItems(PROPOSAL_STRING_CONSTANTS, replaceMap);
    this.setProperties(proposalStrings);
  }
});
