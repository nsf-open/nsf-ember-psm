import { helper } from '@ember/component/helper';
import { assert } from '@ember/debug';
import ENV from 'psm/config/environment';
/* globals moment */

/**
 * Takes in and reformats a unix timestamp according to settings in environment.js
 * ex. input: 1505260800000 output: 9/12/2017
 * @param dateish
 * @returns {*}
 */

export function formatUnixToDate(unixTime) {
  assert('Must pass something', unixTime);
  if (!unixTime[0]) {
    return '';
  }
  if (unixTime[0] && !/^\d+$/.test(unixTime[0])) { // If it is not unix format, return original value
    return unixTime[0];
  }
  return moment.utc(unixTime[0], ENV.DateTimeFormats.deserialize.unix).format(ENV.DateTimeFormats.display.date);
}

export default helper(formatUnixToDate);
