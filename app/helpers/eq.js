import { helper } from '@ember/component/helper';

export function eq(params/*, hash*/) {
  return params.reduce((accum, currentValue) => {
    return accum === currentValue;
  });
}

export default helper(eq);
