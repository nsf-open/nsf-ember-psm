import { helper } from '@ember/component/helper';

import budgetInputConcatArgs from './budget-input-concat-args';

export function budgetGetBudgetInputId(params, optionalArgs) {
  return budgetInputConcatArgs(optionalArgs).replace(/\s/g, '');
}

export default helper(budgetGetBudgetInputId);
