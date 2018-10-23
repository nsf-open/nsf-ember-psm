import { helper } from '@ember/component/helper';

export function proposalStatusDisplay([proposalStatus, key]) {
  return proposalStatus.typeStatusDisplay(key);
}

export default helper(proposalStatusDisplay);
