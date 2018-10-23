import { helper } from '@ember/component/helper';

export function proposalStatusExists([proposalStatus, key]) {
  return proposalStatus.hasTypeStatus(key);
}

export default helper(proposalStatusExists);
