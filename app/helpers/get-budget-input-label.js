import { helper } from '@ember/component/helper';

import budgetInputConcatArgs from './budget-input-concat-args';

export function budgetGetBudgetInputLabel(params, optionalArgs) {
  return budgetInputConcatArgs(optionalArgs, ' - ');
}

export default helper(budgetGetBudgetInputLabel);
