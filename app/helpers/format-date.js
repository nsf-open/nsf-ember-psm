import { helper } from '@ember/component/helper';
import { assert } from '@ember/debug';
import ENV from 'psm/config/environment';
/* globals moment */

/**
 * Takes in and reformats a date according to settings in environment.js
 * ex. input: 20161018 output: 10/18/2016
 * @param dateish
 * @returns {*}
 */
export function formatDate(dateish) {
  assert('Must pass something', dateish);
  return moment(dateish, ENV.DateTimeFormats.deserialize.date).format(ENV.DateTimeFormats.display.date);
}

export default helper(formatDate);
