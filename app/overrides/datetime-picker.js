import DatetimePicker from 'datetime-picker/components/datetime-picker';

export default DatetimePicker.reopen({
  format: 'MM/DD/YYYY',
  allowInputToggle: false,
  useCurrent: false,
  formatOut: 'YYYY-MM-DD',
});
