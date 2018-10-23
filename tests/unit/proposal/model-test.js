import { moduleFor, test } from 'ember-qunit';

moduleFor('model:proposal', 'Unit | Model | proposal', {
  // Specify the other units that are required for this test.
  unit: true
});

function loopCallBack(array, callback) {
  array.forEach(callback);
}

function loopNumbers(numbers, callback) {
  const stringPaddedNumbers = numbers.map((number) => {
    const stringPrefix = (number < 10) ? '0' : '';
    return stringPrefix + number;
  })

  loopCallBack(stringPaddedNumbers, callback);
}

test('if proposal object\'s isSubmittedProposal works', function(assert) {
  const model = this.subject();

  const numbers = [];
  for (let i = 0; i < 12; i += 1) numbers[numbers.length] = i;

  loopNumbers(numbers, (number) => {
    const comparisonValue = Number(number) >= 5;
    model.set('proposalStatus', number);
    assert.equal(model.get('isSubmittedProposal'), comparisonValue);
  });
});

test('if proposal object\'s isInPFUStatus is true in correct situation', function(assert) {
  const model = this.subject();

  const pfuStatusNumbers = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16];

  loopNumbers(pfuStatusNumbers, (number) => {
    model.set('proposalStatus', number);
    assert.equal(model.get('isInPFUStatus'), true);
  });
});

test('if proposal object\'s isInPFUStatus is false in correct situation', function(assert) {
  const model = this.subject();

  const pfuStatusNumbers = [6, 17, 18, 19, 20];

  loopNumbers(pfuStatusNumbers, (number) => {
    model.set('proposalStatus', number);
    assert.equal(model.get('isInPFUStatus'), false);
  });

  // -- special case status === 5 and is 'ORIG' for property propPrepRevnTypeCode
  model.set('propPrepRevnTypeCode', 'ORIG');
  model.set('proposalStatus', 5);
  assert.equal(model.get('isInPFUStatus'), false);
});

const viewOnlyStatuses = [1, 8];

test('if proposal object\'s isViewOnly is true in corection situation', function(assert) {
  const model = this.subject();

  loopNumbers(viewOnlyStatuses, (number) => {
    model.set('proposalStatus', number);
    assert.equal(model.get('isViewOnly'), true);
  });
});

test('if proposal object\'s isViewOnly is false in corection situation', function(assert) {
  const model = this.subject();

  const numbers = [];
  for (let i = 0; i < 21; i += 1) numbers[numbers.length] = i;

  loopNumbers(numbers, (number) => {
    const shouldBeFalse = (viewOnlyStatuses.indexOf(Number(number)) !== -1);
    model.set('proposalStatus', number);
    assert.equal(model.get('isViewOnly'), shouldBeFalse);
  });
});
