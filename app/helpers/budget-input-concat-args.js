import { isNone } from '@ember/utils';

function budgetInputConcatArgs(optionalArgs, separator = '') {
  const argNames = ['yearNumber', 'sectionName', 'lineItemName', 'categoryName'];
  const initConcat = '';

  const idValue = argNames.reduce((accum, argName) => {
    const argValue = (argName === 'yearNumber') ? `Year ${optionalArgs[argName]}` : optionalArgs[argName];

    if (isNone(argValue)) {
      return accum;
    }

    const separatorValue = (accum === initConcat) ? '' : separator;
    accum += separatorValue + argValue;
    return accum;
  }, initConcat);

  return idValue;
}

export default budgetInputConcatArgs;
