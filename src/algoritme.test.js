const tap = require("tap");
const jsc = require("jsverify");

const {
  calculateResult: algoritme2017
} = require("./assets/algoritme2017.js");
const { closeness: algoritme } = require("./algoritme.js");

function runAlgoritme2017(partyAnswer, answer) {
  function mapToOldAnswer(answer, statementId) {
    /*
    Old answer structure:
    type Answer {
      statementId: number,
      selectedAlternative: {
        id: number,
        label: string,
        modifier: string,
        stance: AlternativeStance,
      },
      isPrioritized?: boolean
    }
    */
    return {
      statementId,
      selectedAlternative: {
        id: Math.random(),
        label: "N/A",
        modifier: "N/A",
        stance: answer[statementId].value
      },
      isPrioritized: false
    };
  }

  let oldAnswer = Object.keys(answer).map(mapToOldAnswer.bind(null, answer));
  let oldParties = [
    { id: 0, answers: Object.keys(partyAnswer).map(mapToOldAnswer.bind(null, partyAnswer)) }
  ];

  let [closeness] = algoritme2017(oldParties, oldAnswer);

  return closeness.scorePercent;
}

function randomValue() {
  return (Math.random() > 0.5 ? 1 : -1) * Math.floor(1 + 2 * Math.random());
}

function mockAnswer(n, value = randomValue) {
  return vectorToAnswer(
    Array(n)
      .fill(1)
      .map(_ => value())
  );
}

function vectorToAnswer(vector) {
  return vector.reduce((answer, v, i) => {
    answer[i] = { value: v };
    return answer;
  }, {});
}

function withVectorToAnswer(check) {
  // The order of keys is not really interesing here,
  // but needed for the algorithm to do its thing.
  return function([v1, v2]) {
    return check([vectorToAnswer(v1), vectorToAnswer(v2)]);
  };
}

// Users can answer anywhere in [-2, 2]
let answerArbitrary = jsc.array(jsc.integer(-2, 2));

// Parties are only allowed to answer in [-2, -1]\/[1, 2]
let partyAnswerArbitrary = jsc.array(
  jsc.oneof(jsc.integer(-2, -1), jsc.integer(1, 2))
);

// Property based tests

// NOTE: This test and associated assets can probably be deleted after the election in 2019.
tap.test("gives same result in as old algorithm", function(t) {
  // Ensure equal length. Handling partial results is not handled the same way now.
  let answerPair = jsc.suchthat(
    jsc.pair(answerArbitrary, partyAnswerArbitrary),
    ([a, b]) => a.length === b.length
  );

  function check([answer, partyAnswer]) {
    let closeness = algoritme(partyAnswer, answer);
    let closenessOld = runAlgoritme2017(partyAnswer, answer);

    return closeness === closenessOld;
  }

  jsc.assert(jsc.forall(answerPair, withVectorToAnswer(check)));
  t.end();
});

tap.test("gives answers between 0 and 1", function(t) {
  // Ensure equal length, to limit search space
  let answerPair = jsc.suchthat(
    jsc.pair(answerArbitrary, partyAnswerArbitrary),
    ([a, b]) => a.length === b.length
  );

  function check([answer, partyAnswer]) {
    let closeness = algoritme(partyAnswer, answer);

    return closeness <= 1 && closeness >= 0;
  }

  jsc.assert(jsc.forall(answerPair, withVectorToAnswer(check)));
  t.end();
});

tap.test("calculates based on number of statements in user answer, not number of statements in party answer", function(t) {
  // Ensure unequal length. Answer always smaller than party answer.
  let answerPair = jsc.suchthat(
    jsc.pair(answerArbitrary, partyAnswerArbitrary),
    ([a, b]) => a.length < b.length
  );

  function check([answer, partyAnswer]) {
    let closeness = algoritme(partyAnswer, answer);

    return closeness <= 1 && closeness >= 0;
  }

  jsc.assert(jsc.forall(answerPair, withVectorToAnswer(check)));
  t.end();
});

// Example based tests
tap.test("returns 0 for empty answers", function(t) {
  let closeness = algoritme([], []);

  t.ok(closeness === 0);
  t.end();
});

tap.test("returns 0 for only-null answers", function(t) {
  let closeness = algoritme(
    mockAnswer(2),
    vectorToAnswer([0, 0])
  );

  t.ok(closeness === 0);
  t.end();
});

tap.test("handles fewer answers than total statements", function(t) {
  let answer = mockAnswer(23);
  let partyAnswer = mockAnswer(24);
  let closeness = algoritme(partyAnswer, answer);

  t.ok(closeness >= 0);
  t.end();
});

tap.test("gives correct answer for simple un-even case", function(t) {
  let answer = vectorToAnswer([1, 1]);
  let partyAnswer = vectorToAnswer([-2, 1, 2]);
  let closeness = algoritme(partyAnswer, answer);

  t.ok(closeness === (8 - 3) / 8);
  t.end();
});

tap.test("throws when given more answers than statements", function(t) {
  let answer = mockAnswer(5);
  let partyAnswer = mockAnswer(3);

  t.throws(() => algoritme(partyAnswer, answer));
  t.end();
});

tap.test("doesn't throw when given too many user skips", function(t) {
  let answer = mockAnswer(6, () => 0);
  let partyAnswer = mockAnswer(6);

  t.ok(algoritme(partyAnswer, answer) >= 0);
  t.end();
});

tap.test("throws when given invalid user answer value", function(t) {
  let answer = mockAnswer(1, () => -3);
  let partyAnswer = mockAnswer(1);

  t.throws(() => algoritme(partyAnswer, answer));
  t.end();
});

tap.test("throws when given invalid party answer value", function(t) {
  let answer = mockAnswer(1);
  let partyAnswer = mockAnswer(1, () => -3);

  t.throws(() => algoritme(partyAnswer, answer));
  t.end();
});

tap.test("throws when given party skips", function(t) {
  let answer = mockAnswer(1);
  let partyAnswer = mockAnswer(1, () => 0);

  t.throws(() => algoritme(partyAnswer, answer));
  t.end();
});
