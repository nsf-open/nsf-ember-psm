import { helper } from '@ember/component/helper';

export function existsIn(object) {
  const list = object[1];
  return list.includes(object[0]);
}

export default helper(existsIn);
