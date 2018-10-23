import Mixin from '@ember/object/mixin';
/* globals moment */

/**
 * Frequently used utility function collection.
 *
 * @namespace Mixins
 * @class CommonUtility
 */
export default Mixin.create({
  /**
     * Converts a number into USD currency, with a couple of optional arguments to control formatting aspects of the result.
     *
     * @method moneyFormat
     *
     * @param {Integer} number The number to format.
     * @param {Integer} [rightPrecision=0] The maximum number of digits to the right of the decimal.
     * @param {Integer} [groupWidth=3] The size of formatted number groups to the right of the decimal, separated by commas.
     *
     * @return {String}
     */
  moneyFormat(number, rightPrecision, groupWidth) {
    const numberIn = Number(number);
    let rightPrecisionBitwiseNegation = 0;
    const re = `\\d(?=(\\d{${groupWidth || 3}})+${rightPrecision > 0 ? '\\.' : '$'})`;
    if (typeof rightPrecision === 'number' && !isNaN(rightPrecision) && rightPrecision !== Infinity) {
      rightPrecisionBitwiseNegation = rightPrecision > 0 ? Math.floor(rightPrecision) : Math.ceil(rightPrecision)
    }
    return numberIn.toFixed(Math.max(0, rightPrecisionBitwiseNegation)).replace(new RegExp(re, 'g'), '$&,');
  },

  /**
     * converts Money String to Float Number
     * takes in a money format like $1,200,212.00 then strips all non-numeric characters.
     * this is needed to perform comparisons. without this conversion you're comparing strings
     * which is incorrect.
     *
     * @param string price: ember object property name that can be reached with this.get
     */
  moneyUnFormat(currency) {
    return parseFloat(this.get(currency).replace(/[^0-9-.]/g, '')); // $12,345.99 ==> 12345.99
  },

  /**
     * Date format Helper using moment.js
     * @param string p: ember object property name
     * @param string format : date format like YYYY-MM-DD
     */
  momentNormalize(p, format) {
    const m = moment(this.get(p));
    return m.isValid() ? m.format(format || 'MM/DD/YYYY') : 'None';
  },

  /**
     * @method momentNormalizeToIsoString
     *
     * @param {String} p The Ember object property name of the value to normalize.
     * @param {String} [format=YYYY-MM-DD] The format
     */
  momentNormalizeToIsoString(p, format) {
    const m = moment(this.get(p));
    return m.isValid() ? m.format(format || 'YYYY-MM-DD') : 'None';
  },

  /**
     *
     *
     * @method stringDivider
     *
     * @param {String} str
     * @param {Integer} [width=40]
     * @param {String} [prefix=]
     * @param {String} [postfix=]
     *
     * @return {String}
     */
  stringDivider(str, width = 40, prefix = '', postfix = '') {
    if (str.length > width) {
      let p = width;

      for (; p > 0 && !/\s/.test(str[p]); p -= 1) {
        // Continue
      }

      if (p > 0) {
        const left = str.substring(0, p);
        const right = str.substring(p + 1);

        return prefix + left + postfix + this.stringDivider(right, width, prefix, postfix);
      }
    }

    return prefix + str + postfix;
  },

  /**
     * Truncates a string of characters to the nearest whitespace either on or before the maximum width.
     *
     * @method stringWrap
     *
     * @param {String} str The string to truncate.
     * @param {Integer} [width=40] The maximum width of the truncated result. Since the split will occur at the nearest whitespace on or before this character limit the returned string length with almost always be shorter.
     * @param {String} [postfix= ...] An optional string that will be appended to the end of the result string if it does get truncated. This does not count against the maximum character limit.
     *
     * @return {String} The truncated string.
     */
  stringWrap(str, width = 40, postfix = ' ...') {
    if (str.length > width) {
      let p = width;

      for (; p > 0 && str[p] != ' '; p -= 1) {
        // Continue
      }

      if (p > 0) {
        const left = str.substring(0, p);
        return left + postfix;
      }

      return str.substring(0, width) + postfix;
    }

    return str;
  },

  /**
     * @method normalizeTime
     *
     * @param {String} p The Ember object property name of the value to normalize.
     * @param {String} [format=h:mm A] The format
     */
  normalizeTime(p, format) {
    const m = moment(this.get(p));
    return m.isValid() ? m.format(format || 'h:mm A') : 'None';
  },

  /**
     * @method formatTime
     *
     * @param {String} h: Hours
     * @param {String} m: Minutes
     * @param {String} a: AM/PM
     * For h= 7, m = 25, a = PM, Output will be 7:25 PM
     */
  formatTime(h, m, a) {
    let time;
    if (this.get(h) !== null && this.get(m) !== null && this.get(a) !== null) {
      time = `${this.get(h)}:${this.get(m)} ${this.get(a)}`;
      return moment(time, 'h:mm A').format('h:mm A');
    }
  },

  /**
     * @method normalizeDateTime
     *
     * @param {String} d: Date
     * @param {String} t: time
     * Takes the hour, minute and AM/PM to format the time.
     * For e.g. Hour = 7, Minute = 25, AMPM= PM, Date=01/01/2016 will be computed as "2016-01-01 19:25 PM"
     */
  normalizeDateTime(d, t, format) {
    const date = moment(this.get(d), 'YYYY-MM-DD'),
      time = moment(this.get(t), 'h:mm A');

    return `${date.isValid() ? date.format(format || 'YYYY-MM-DD') : 'None'} ${time.isValid() ? time.format(format || 'HH:mm') : ''}`;
  },

  /**
     * @method validateDates
     *
     * @param {String} startDate: Start Date
     * @param {String} finishDate: End Date
     * Returns true if end date is before the start date
     */
  validateDates(startDate, finishDate) {
    const begin = this.get(startDate),
      end = this.get(finishDate);
    if (begin == null || end == null) { return; }
    const start = moment(begin, 'YYYY-MM-DD'),
      finish = moment(end, 'YYYY-MM-DD');
    start.hour(0).minute(0).second(0).millisecond(0);
    finish.hour(0).minute(0).second(0).millisecond(0);
    return finish.isBefore(start);
  },

  sameDate(startDate, finishDate) {
    const begin = this.get(startDate),
      end = this.get(finishDate);
    if (begin == null || end == null) {
      return;
    }
    const start = moment(begin, 'YYYY-MM-DD'),
      finish = moment(end, 'YYYY-MM-DD');
    start.hour(0).minute(0).second(0).millisecond(0);
    finish.hour(0).minute(0).second(0).millisecond(0);
    return finish.isSame(start);
  },

  /**
     * @method validateTimes
     *
     * @param {String} startDate: Start Date
     * @param {String} finishDate: End Date
     * Returns true if end date is before the start date
     */
  validateTimes(startTime, finishTime) {
    const begin = this.get(startTime),
      end = this.get(finishTime);

    const start = moment(begin, 'h:mm A'),
      finish = moment(end, 'h:mm A');
    return finish.isSame(start) ? true : finish.isBefore(start);
  },

  /**
     * Environment name strings. Should be treated like a constant.
     *
     * @property ENVS
     * @type Object
     * @readOnly
     */
  ENVS: {
    local: 'localhost',
    dev: 'development',
    intg: 'integration',
    acpt: 'acceptance',
    prod: 'production'
  },

  /**
     * Environment rules: pairs environment names to host names.
     *
     * @property ENV_RULES
     * @type Object[]
     * @readOnly
     */
  ENV_RULES: [
      // Removed
  ],

  /**
     * Until the environment flag gets passed as a variable on server start-up, this will work as a quick way to determine what
     * environment the application is running in based on the host name. Each possible environment is represented as an object which
     * has a "name" property - the value which will be returned - and "hosts" property, which is an array of possible
     * `window.location.hostname` values that are associated with that name. If the current value of `window.location.hostname` matches
     * an item in one of the arrays the corresponding name is returned.
     *
     * @method getEnvironmentName
     *
     * @return {String} The current environment name if it can be determined, or "production".
     */
  getEnvironmentName() {
    // return "integration";

    const hostname = this.getHostname();

    for (let i = 0; i < this.ENV_RULES.length; i += 1) {
      if (this.ENV_RULES[i].hosts.indexOf(hostname) > -1) {
        return this.ENV_RULES[i].name;
      }
    }

    return this.ENVS.prod;
  },

  /**
     * Returns the value of `window.location.hostname`. This method only exists for the sake of being able to unit test getEnvironmentName().
     *
     * @method getHostname
     *
     * @return {String} The current hostname.
     */
  getHostname() {
    return window.location.hostname.toLowerCase();
  }
});
