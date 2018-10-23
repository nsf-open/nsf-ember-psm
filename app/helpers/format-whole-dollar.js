import { helper } from '@ember/component/helper';

export function formatWholeDollar(amount/* , hash*/) {
  const origAmount = amount; // might have passed in 'Error', need to make sure we can pass that back out
  amount = amount.toString().trim();
  amount = amount.replace(/[^0-9]/g, '');
  amount = parseInt(amount, 10);

  if (isNaN(amount)) return origAmount; /* return 'Error';*/
  const dollars = amount.toString().replace(/\B(?=(?:\d{3})+(?!\d))/g, ',');
  return `$${dollars}`;
}

export default helper(formatWholeDollar);
