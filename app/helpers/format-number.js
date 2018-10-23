import { helper } from '@ember/component/helper';

export function formatNumber(amount/* , hash*/) {
  if (isNaN(amount)) return amount; /* return 'Error';*/
  const number = amount.toString().replace(/\B(?=(?:\d{3})+(?!\d))/g, ',');
  return number;
}

export default helper(formatNumber);
