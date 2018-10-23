import { helper } from '@ember/component/helper';

const usPostalCode = /^\d{5}-\d{4}$/;

export function formatPostalCode(postalCode) {
  if (usPostalCode.test(postalCode)) { return postalCode; } // if well-formed, return immediately

  postalCode = postalCode.toString().trim();
  postalCode = postalCode.replace(/[^0-9]/g, '');
  if (postalCode.length > 5) {
    postalCode = `${postalCode.substring(0, 5)}-${postalCode.slice(5, postalCode.length)}`;
  }

  return postalCode;
}

export default helper(formatPostalCode);
