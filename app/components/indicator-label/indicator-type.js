import { enumeration } from '../../utils';

const IndicatorType = enumeration({
  New: 1,
  UpdatesSaved: 2,
  RevisionSaved: 3,
  UpdatesNeeded: 4,
  NotCompliant: 5,
  NoIndicator: 6
});

export default IndicatorType;
