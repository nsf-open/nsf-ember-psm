import { helper } from '@ember/component/helper';

export function codeToPSMRole(code) {
  code = code.toString();

  switch (code) {
    case '01':
      return 'Principal Investigator';
    case '02':
      return 'co-Principal Investigator';
    case '03':
      return 'Other Senior Personnel';
    case '04':
      return 'Other Authorized User';
    default:
      return '';
  }
}


export default helper(codeToPSMRole);
