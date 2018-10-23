import Ember from 'ember';
import callAction from 'datetime-picker/utils/call-action';
import moment from 'moment';

const {
  Component,
  get,
  set,
  setProperties,
  computed,
  isEmpty,
  typeOf,
  run,
} = Ember;

export default Component.extend({
  concatenatedProperties: ['textFieldClassNames'],

  classNames: ['date'],

  classNameBindings: ['showCalendarIcon:input-group', 'disabled'],

  textFieldClassNames: ['form-control'],

  pickerElement: null,

  pickerInstance: null,

  showCalendarIcon: true,

  textFieldName: null,

  placeholder: null,

  open: false,

  disabled: false,

  date: null,

  useStrings: false,

  formatOut: null,

  isInternalDateUpdate: false,

  minDate: false,

  maxDate: false,

  format: false,

  dayViewHeaderFormat: 'MMMM YYYY',

  extraFormats: false,

  stepping: 1,

  useCurrent: true,

  collapse: true,

  defaultDate: false,

  disabledDates: false,

  enabledDates: false,

  useStrict: false,

  sideBySide: false,

  daysOfWeekDisabled: [],

  calendarWeeks: false,

  viewMode: 'days',

  toolbarPlacement: 'default',

  showTodayButton: false,

  showClear: false,

  showClose: false,

  widgetParent: null,

  keepOpen: false,

  inline: false,

  keepInvalid: false,

  debug: false,

  ignoreReadonly: false,

  disabledTimeIntervals: false,

  allowInputToggle: false,

  focusOnShow: true,

  enabledHours: false,

  disabledHours: false,

  viewDate: false,

  iconCalendar: 'fa fa-calendar',

  iconTime: 'fa fa-clock-o',

  iconDate: 'fa fa-calendar',

  iconUp: 'fa fa-angle-up',

  iconDown: 'fa fa-angle-down',

  iconPrevious: 'fa fa-angle-left',

  iconNext: 'fa fa-angle-right',

  iconToday: 'fa fa-crosshairs',

  iconClear: 'fa fa-trash',

  iconClose: 'fa fa-remove',

  widgetPositioningVertical: 'auto',

  widgetPositioningHorizontal: 'auto',

  tooltipToday: 'Go to today',

  tooltipClear: 'Clear selection',

  tooltipClose: 'Close the picker',

  tooltipSelectMonth: 'Select month',

  tooltipPrevMonth: 'Previous month',

  tooltipNextMonth: 'Next month',

  tooltipSelectYear: 'Select year',

  tooltipPrevYear: 'Previous year',

  tooltipNextYear: 'Next year',

  tooltipSelectDecade: 'Select decade',

  tooltipPrevDecade: 'Previous decade',

  tooltipNextDecade: 'Next decade',

  tooltipPrevCentury: 'Previous century',

  tooltipNextCentury: 'Next century',


  icons: computed('iconTime', 'iconDate', 'iconUp', 'iconDown', 'iconPrevious',
    'iconNext', 'iconToday', 'iconClear', 'iconClose', function() {
      return {
        time: get(this, 'iconTime'),
        date: get(this, 'iconDate'),
        up: get(this, 'iconUp'),
        down: get(this, 'iconDown'),
        previous: get(this, 'iconPrevious'),
        next: get(this, 'iconNext'),
        today: get(this, 'iconToday'),
        clear: get(this, 'iconClear'),
        close: get(this, 'iconClose'),
      };
    }).readOnly(),


  widgetPositioning: computed('widgetPositioningVertical', 'widgetPositioningHorizontal', function() {
    return {
      vertical: get(this, 'widgetPositioningVertical'),
      horizontal: get(this, 'widgetPositioningHorizontal'),
    };
  }).readOnly(),


  tooltips: computed('tooltipToday', 'tooltipClear', 'tooltipClose', 'tooltipSelectMonth',
    'tooltipPrevMonth', 'tooltipNextMonth', 'tooltipSelectYear', 'tooltipPrevYear',
    'tooltipNextYear', 'tooltipSelectDecade', 'tooltipPrevDecade', 'tooltipNextDecade',
    'tooltipPrevCentury', 'tooltipNextCentury', function() {
      return {
        today: get(this, 'tooltipToday'),
        clear: get(this, 'tooltipClear'),
        close: get(this, 'tooltipClose'),
        selectMonth: get(this, 'tooltipSelectMonth'),
        prevMonth: get(this, 'tooltipPrevMonth'),
        nextMonth: get(this, 'tooltipNextMonth'),
        selectYear: get(this, 'tooltipSelectYear'),
        prevYear: get(this, 'tooltipPrevYear'),
        nextYear: get(this, 'tooltipNextYear'),
        selectDecade: get(this, 'tooltipSelectDecade'),
        prevDecade: get(this, 'tooltipPrevDecade'),
        nextDecade: get(this, 'tooltipNextDecade'),
        prevCentury: get(this, 'tooltipPrevCentury'),
        nextCentury: get(this, 'tooltipNextCentury'),
      };
    }).readOnly(),


  settableProps: computed(function() {
    return ['date', 'format', 'stepping', 'dayViewHeaderFormat', 'extraFormats', 'minDate',
      'maxDate', 'useCurrent', 'collapse', 'defaultDate', 'disabledDates', 'enabledDates',
      'useStrict', 'daysOfWeekDisabled', 'calendarWeeks', 'viewMode', 'toolbarPlacement',
      'showTodayButton', 'showClose', 'showClear', 'sideBySide', 'keepOpen', 'inline',
      'keepInvalid', 'debug', 'ignoreReadonly', 'disabledTimeIntervals', 'allowInputToggle',
      'focusOnShow', 'enabledHours', 'disabledHours', 'viewDate'];
  }).readOnly(),


  iconProps: computed(function() {
    return ['iconCalendar', 'iconTime', 'iconDate', 'iconUp', 'iconDown', 'iconPrevious',
      'iconNext', 'iconToday', 'iconClear', 'iconClose'];
  }).readOnly(),


  tooltipProps: computed(function() {
    return ['tooltipToday', 'tooltipClose', 'tooltipClear', 'tooltipSelectMonth',
      'tooltipPrevMonth', 'tooltipNextMonth', 'tooltipSelectYear', 'tooltipPrevYear',
      'tooltipNextYear', 'tooltipSelectDecade', 'tooltipNextDecade', 'tooltipSelectCentury',
      'tooltipPrevCentury', 'tooltipNextCentury'];
  }).readOnly(),


  mutableProps: computed('settableProps', 'iconProps', 'tooltipProps', function() {
    return get(this, 'settableProps').concat(get(this, 'iconProps'), get(this, 'tooltipProps'));
  }).readOnly(),


  defaultFalseProps: computed(function() {
    return ['minDate', 'maxDate', 'defaultDate', 'disabledDates', 'enabledDates', 'enabledHours',
      'disabledHours', 'viewDate'];
  }).readOnly(),


  didInsertElement() {
    let target = null;

    if (get(this, 'showCalendarIcon')) {
      target = this.$();
    }
    else {
      target = this.$(`.${get(this, 'textFieldClassNames').join('.')}`);
    }

    const pickerElement = target.datetimepicker(this._buildConfig());
    const pickerInstance = pickerElement.data('DateTimePicker');

    pickerElement.on('dp.hide', e => this.send('onHide', e));
    pickerElement.on('dp.show', () => this.send('onShow'));
    pickerElement.on('dp.change', e => this.send('onChange', e));
    pickerElement.on('dp.error', e => this.send('onError', e));
    pickerElement.on('dp.update', e => this.send('onUpdate', e));

    if (get(this, 'open')) {
      pickerInstance.show();
    }

    if (get(this, 'disabled')) {
      pickerInstance.disable();
    }

    setProperties(this, { pickerElement, pickerInstance });
    this._super(...arguments);
  },


  willDestroyElement() {
    get(this, 'pickerElement').off('dp.hide dp.show dp.change dp.error dp.update');
    get(this, 'pickerInstance').destroy();

    this._super(...arguments);
  },


  didReceiveAttrs() {
    const newAttrs = (arguments[0]) ? arguments[0] : null;
    const oldAttrs = (arguments[1]) ? arguments[1] : null;
    if (!oldAttrs || !newAttrs) {
      return this._super(...arguments);
    }

    const changed = {};

    // Step 1: Figure out what changed
    let keys = Object.keys(newAttrs);

    for (let i = 0; i < keys.length; i += 1) {
      const key = keys[i];

      let newVal = get(newAttrs, `${key}.value`);
      let oldVal = get(oldAttrs, `${key}.value`);

      if (newVal === undefined) {
        newVal = get(newAttrs, key);
      }

      if (oldVal === undefined) {
        oldVal = get(oldAttrs, key);
      }

      switch (typeOf(newVal)) {
        case 'string':
        case 'boolean':
        case 'number':
        case 'null':
          if (newVal !== oldVal) {
            set(changed, key, this.coerceToDefault(key, newVal));
          }
          break;

        case 'object':
        case 'instance':
          if(!this._areMomentsEqual(newVal, oldVal)) {
            set(changed, key, this.coerceToDefault(key, newVal));
          }
          else {
            // Maybe do more here... haven't come across any checks needed
          }
          break;

        default:
          // Do Nothing
          break;
      }
    }

    // Step 2: Apply Changes
    keys = Object.keys(changed);

    const settable = get(this, 'settableProps');
    let iconsUpdated = false;
    let tooltipsUpdated = false;

    for (let i = 0; i < keys.length; i += 1) {
      const key = keys[i];

      if (key === 'date' && !this.isInternalDateUpdate) {
        get(this, `pickerInstance.${key}`)(get(changed, key));
        this.isInternalDateUpdate = false;
      }
      else if (!iconsUpdated && key.substr(0, 4) === 'icon') {
        get(this, 'pickerInstance').icons(get(this, 'icons'));
        iconsUpdated = true;
      }
      else if (!tooltipsUpdated && key.substr(0, 7) === 'tooltip') {
        get(this, 'pickerInstance').tooltips(get(this, 'tooltips'));
        tooltipsUpdated = true;
      }
      else if (key === 'disabled') {
        const val = get(changed, 'disabled');

        if (val) {
          get(this, 'pickerInstance').disable();
        }
        else {
          get(this, 'pickerInstance').enable();
        }
      }
      else {
        if (settable.indexOf(key) !== -1) {
          get(this, `pickerInstance.${key}`)(get(changed, key));
        }
      }
    }

    return this._super(...arguments);
  },


  _buildConfig() {
    const props = get(this, 'settableProps');
    const date = get(this, 'date');
    const result = {
      date,
      icons: get(this, 'icons'),
      tooltips: get(this, 'tooltips'),
      datepickerInput: (`#${get(this, 'elementId')}-input`),
    };

    for (let i = 0; i < props.length; i += 1) {
      result[props[i]] = this.coerceToDefault(props[i], get(this, props[i]));
    }

    return result;
  },


  _applyDateFormatRules(date) {
    date = (date === false) ? null : date;

    if (date && typeOf(date) !== 'string' && get(this, 'useStrings')) {
      const formatA = get(this, 'formatOut');
      const formatB = get(this, 'format');
      let format = null;

      if (typeOf(formatA) === 'string') {
        format = formatA;
      }
      else if (formatA === null) {
        format = formatB;
      }

      date = format ? date.format(format) : date.format();
    }

    return date;
  },


  actions: {
    onShow() {
      callAction(this, 'onShow');
    },

    onHide({ date }) {
      callAction(this, 'onHide', this._applyDateFormatRules(date));
    },

    onChange({ date, oldDate }) {
      if (date === false || date === null || get(this, 'keepInvalid') || (moment.isMoment(date) && !date.isSame(oldDate))) {
        run.scheduleOnce('sync', this, 'internalDateUpdate', date, oldDate);
      }
    },

    onError({ date }) {
      callAction(this, 'onError', date);
    },

    onUpdate({ change, viewDate }) {
      callAction(this, 'onUpdate', change, this._applyDateFormatRules(viewDate));
    },
  },


  internalDateUpdate(date, oldDate) {
    date = this._applyDateFormatRules(date);
    oldDate = this._applyDateFormatRules(date);

    this.isInternalDateUpdate = true;
    set(this, 'date', date);
    callAction(this, 'onChange', date, oldDate);
  },


  coerceToDefault(key, value) {
    const props = get(this, 'defaultFalseProps');

    if (props.indexOf(key) !== -1) {
      if (value === null || isEmpty(value)) {
        return false;
      }
    }

    return value;
  },


  _areMomentsEqual(valA, valB) {
    if (moment.isMoment(valA) && moment.isMoment(valB)) {
      const aIsValid = valA.isValid();
      const bIsValid = valB.isValid();

      if (aIsValid !== bIsValid) {
        return false;
      }
      else if (aIsValid && bIsValid) {
        return valA.isSame(valB);
      }
      else {
        return valA._i === valB._i;
      }
    }

    return Object.is(valA, valB);
  },


  focusIn(event) {
    run.throttle(this, '_throttledFocusIn', event, 15);
  },


  focusOut(event) {
    run.throttle(this, '_throttledFocusOut', event, 15);
  },


  _throttledFocusIn(event) {
    callAction(this, 'focus-in', event);
  },


  _throttledFocusOut(event) {
    callAction(this, 'focus-out', event);
  },
});
