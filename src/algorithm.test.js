const tap = require("tap");
const jsc = require("jsverify");

const { calculateResult: algorithm2017 } = require("./assets/algorithm2017.js");
const { distance: algorithm } = require("./algorithm.js");

function runAlgoritme2017({ party, voter }) {
  function mapToOldAnswer(positions, statementId) {
    /*
    Old positions structure:
    type Poisitions {
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
        stance: positions[statementId].value
      },
      isPrioritized: false
    };
  }

  let oldAnswer = Object.keys(voter).map(mapToOldAnswer.bind(null, voter));
  let oldParties = [
    {
      id: 0,
      answers: Object.keys(party).map(mapToOldAnswer.bind(null, party))
    }
  ];

  let [closeness] = algorithm2017(oldParties, oldAnswer);

  return closeness.scorePercent;
}

function randomValue() {
  return (Math.random() > 0.5 ? 1 : -1) * Math.floor(1 + 2 * Math.random());
}

function positionsMock({ n, valueGenerator = randomValue }) {
  return vectorToPositions(
    Array(n)
      .fill(1)
      .map((_, i) => [i, valueGenerator()])
  );
}

function vectorToPositions(vector) {
  return vector.reduce((positions, [id, value]) => {
    positions[id] = { value };
    return positions;
  }, {});
}

function arrayToVector(arr) {
  return arr.map((v, i) => [i, v]);
}

function withArrToPositions(check) {
  // The order of keys is not really interesing here,
  // but needed for the algorithm to do its thing.
  return function([arr1, arr2]) {
    return check([
      vectorToPositions(arrayToVector(arr1)),
      vectorToPositions(arrayToVector(arr2))
    ]);
  };
}

let arbitraryPositions = jsc.array(jsc.number(-2, 2));

// Arbitrary set of positions without skips
let arbitraryPositionsWithoutZeroes = jsc.array(
  jsc.oneof(jsc.integer(-2, -1), jsc.integer(1, 2))
);

// Property based tests

// NOTE: This test and associated assets can probably be deleted after the election in 2019.
tap.test("identical to 2017 algorithm", function(t) {
  // Ensure equal length and therefore identical set of answered statements.
  // Handling of un-even sets of answered statements is different.
  // Filtering out skipped statements works differently, so we'll avoid that.
  let arbitraryPositionsPair = jsc.suchthat(
    jsc.pair(arbitraryPositionsWithoutZeroes, arbitraryPositionsWithoutZeroes),
    ([a, b]) => a.length === b.length
  );

  function check([a, b]) {
    let distance = algorithm(a, b);
    let distanceOld = runAlgoritme2017({ party: a, voter: b });

    return distance === distanceOld;
  }

  jsc.assert(jsc.forall(arbitraryPositionsPair, withArrToPositions(check)));
  t.end();
});

tap.test("algorithm is symmetrical", function(t) {
  let arbitraryPositionsPair = jsc.suchthat(
    jsc.pair(arbitraryPositions, arbitraryPositions),
    ([a, b]) => a.length > 10 && b.length > 10
  );

  function check([a, b]) {
    let distanceA = algorithm(a, b);
    let distanceB = algorithm(b, a);

    return distanceA === distanceB;
  }

  jsc.assert(jsc.forall(arbitraryPositionsPair, withArrToPositions(check)));
  t.end();
});

tap.test("handles identical set of answered statements", function(t) {
  // Ensure equal length, to have identical sets of answered statements
  let arbitraryPositionsPair = jsc.suchthat(
    jsc.pair(arbitraryPositions, arbitraryPositions),
    ([a, b]) => a.length === b.length
  );

  function check([a, b]) {
    let distance = algorithm(a, b);

    return distance <= 1 && distance >= 0;
  }

  jsc.assert(jsc.forall(arbitraryPositionsPair, withArrToPositions(check)));
  t.end();
});

tap.test("handles uneven number of answered statements", function(t) {
  // Ensure un-even length.
  let arbitraryPositionsPair = jsc.suchthat(
    jsc.pair(arbitraryPositions, arbitraryPositions),
    ([a, b]) => a.length !== b.length
  );

  function check([a, b]) {
    let distance = algorithm(a, b);

    return distance <= 1 && distance >= 0;
  }

  jsc.assert(jsc.forall(arbitraryPositionsPair, withArrToPositions(check)));
  t.end();
});

// Example based tests
tap.test("both empty", function(t) {
  let closeness = algorithm([], []);

  t.ok(closeness === 0);
  t.end();
});

tap.test("left-empty", function(t) {
  let closeness = algorithm(positionsMock({ n: 1 }), []);

  t.ok(closeness === 0);
  t.end();
});

tap.test("right-empty", function(t) {
  let closeness = algorithm([], positionsMock({ n: 1 }));

  t.ok(closeness === 0);
  t.end();
});

tap.test("left just-0s", function(t) {
  let a = vectorToPositions([[0, 0], [1, 0]]);
  let b = positionsMock({ n: 2 });
  let distance = algorithm(a, b);

  t.ok(distance === 0);
  t.end();
});

tap.test("right just-0s", function(t) {
  let a = positionsMock({ n: 2 });
  let b = vectorToPositions([[0, 0], [1, 0]]);
  let distance = algorithm(a, b);

  t.ok(distance === 0);
  t.end();
});

tap.test("both just-0s", function(t) {
  let a = vectorToPositions([[2, 0], [3, 0]]);
  let b = vectorToPositions([[0, 0], [1, 0]]);
  let distance = algorithm(a, b);

  t.ok(distance === 0);
  t.end();
});

tap.test("left un-even", function(t) {
  let a = vectorToPositions([[0, -2], [1, 1], [2, 2]]);
  let b = vectorToPositions([[0, 1], [1, 1]]);
  let distance = algorithm(a, b);

  t.ok(distance === (8 - 3) / 8);
  t.end();
});

tap.test("right un-even", function(t) {
  let a = vectorToPositions([[0, 1], [1, 1]]);
  let b = vectorToPositions([[0, -2], [1, 1], [2, 2]]);
  let distance = algorithm(a, b);

  t.ok(distance === (8 - 3) / 8);
  t.end();
});

tap.test("both un-even", function(t) {
  let a = vectorToPositions([[-1, -1], [0, 1], [1, 1]]);
  let b = vectorToPositions([[0, -2], [1, 1], [2, 2]]);
  let distance = algorithm(a, b);

  t.ok(distance === (8 - 3) / 8);
  t.end();
});

tap.test("symmetrical with example left-block", function(t) {
  let left = [
    ["3", -0.25],
    ["8", -0.25],
    ["16", -0.25],
    ["23", 0.25],
    ["38", -0.25],
    ["42", -0.5],
    ["63", -0.5],
    ["64", 0.25],
    ["71", -0.25],
    ["142", -0.25],
    ["222", -0.25],
    ["391", 0.25],
    ["411", -0.5],
    ["432", -0.5],
    ["442", 0.25]
  ];
  let voter = [
    ["3", randomValue()],
    ["8", randomValue()],
    ["16", randomValue()],
    ["23", randomValue()],
    ["38", randomValue()],
    ["42", randomValue()],
    ["63", randomValue()],
    ["64", randomValue()],
    ["71", randomValue()],
    ["142", randomValue()],
    ["222", randomValue()],
    ["391", randomValue()],
    ["411", randomValue()],
    ["432", randomValue()],
    ["442", randomValue()]
  ];
  let a = vectorToPositions(left);
  let b = vectorToPositions(voter);

  let distanceA = algorithm(a, b);
  let distanceB = algorithm(b, a);

  t.ok(distanceA === distanceB);
  t.end();
});

tap.test("symmetrical with example centre-block", function(t) {
  let centre = [
    ["3", 0.33],
    ["8", -0.66],
    ["16", 0.33],
    ["23", -0.66],
    ["38", -0.33],
    ["42", 0.66],
    ["63", -0.66],
    ["64", 0.33],
    ["71", 0.33],
    ["142", 0.66],
    ["222", 0.33],
    ["391", -0.33],
    ["411", -0.66],
    ["432", 0.33],
    ["442", 0.66]
  ];
  let voter = [
    ["3", randomValue()],
    ["8", randomValue()],
    ["16", randomValue()],
    ["23", randomValue()],
    ["38", randomValue()],
    ["42", randomValue()],
    ["63", randomValue()],
    ["64", randomValue()],
    ["71", randomValue()],
    ["142", randomValue()],
    ["222", randomValue()],
    ["391", randomValue()],
    ["411", randomValue()],
    ["432", randomValue()],
    ["442", randomValue()]
  ];
  let a = vectorToPositions(centre);
  let b = vectorToPositions(voter);

  let distanceA = algorithm(a, b);
  let distanceB = algorithm(b, a);

  t.ok(distanceA === distanceB);
  t.end();
});

tap.test("symmetrical with example right-block", function(t) {
  let right = [
    ["3", 1],
    ["8", 1],
    ["16", -1],
    ["23", 1],
    ["38", -0.5],
    ["42", 1],
    ["63", -0.5],
    ["64", -0.5],
    ["71", -1],
    ["142", -1],
    ["222", -1],
    ["391", -1],
    ["411", -1],
    ["432", 1],
    ["442", -1]
  ];
  let voter = [
    ["3", randomValue()],
    ["8", randomValue()],
    ["16", randomValue()],
    ["23", randomValue()],
    ["38", randomValue()],
    ["42", randomValue()],
    ["63", randomValue()],
    ["64", randomValue()],
    ["71", randomValue()],
    ["142", randomValue()],
    ["222", randomValue()],
    ["391", randomValue()],
    ["411", randomValue()],
    ["432", randomValue()],
    ["442", randomValue()]
  ];
  let a = vectorToPositions(right);
  let b = vectorToPositions(voter);

  let distanceA = algorithm(a, b);
  let distanceB = algorithm(b, a);

  t.ok(distanceA === distanceB);
  t.end();
});

tap.test("readme example", function(t) {
  let a = vectorToPositions([[0, 1], [1, -1]]);
  let b = vectorToPositions([[0, 0], [1, -2]]);
  let distance = algorithm(a, b);

  t.ok(distance === 0.75);
  t.end();
});
