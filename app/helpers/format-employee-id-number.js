import { helper } from '@ember/component/helper';

const einNumbers = /^\d+$/;

export function formatEmployeeIdNumber(ein) {
  ein = ein.toString().trim();
  ein = ein.replace(/[^0-9]/g, '');
  if (einNumbers.test(ein)) {
    ein = `${ein.substring(0, 3)}-${ein.slice(3, 5)}-${ein.slice(5, ein.length)}`;
    return ein;
  }
  return '';
}

export default helper(formatEmployeeIdNumber);
