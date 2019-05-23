const tap = require("tap");
const jsc = require("jsverify");

const { calculateResult: algorithm2017 } = require("./assets/algorithm2017.js");
const { distance, distanceMap, distanceMix } = require("./algorithm.js");
const { toPositions } = require("./domain/positions.js");
const {
  positions: positionsMock,
  position: positionMock
} = require("./__helpers/mocks.js");

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

function arrayToPositionsHelper(check) {
  // The order of keys is not really interesing here,
  // but needed for the algorithm to do its thing.
  return function(vectors) {
    let args = vectors
      .map(vector => vector.map((v, i) => [i, v]))
      .map(vector => toPositions(vector));

    return check(args);
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
    let d = distance(a, b);
    let dOld = runAlgoritme2017({ party: a, voter: b });

    return d === dOld;
  }

  let wrappedCheck = arrayToPositionsHelper(check);

  jsc.assert(jsc.forall(arbitraryPositionsPair, wrappedCheck));
  t.end();
});

tap.test("algorithm is symmetrical", function(t) {
  let arbitraryPositionsPair = jsc.suchthat(
    jsc.pair(arbitraryPositions, arbitraryPositions),
    ([a, b]) => a.length > 10 && b.length > 10
  );

  function check([a, b]) {
    let distanceA = distance(a, b);
    let distanceB = distance(b, a);

    return distanceA === distanceB;
  }

  let wrappedCheck = arrayToPositionsHelper(check);

  jsc.assert(jsc.forall(arbitraryPositionsPair, wrappedCheck));
  t.end();
});

tap.test("not answered and missing are identical", function(t) {
  let arbitraryPositionsPair = jsc.pair(
    jsc.array(jsc.constant(null)),
    jsc.constant([])
  );

  function check([a, b]) {
    return distance(a, b) === 0;
  }

  let wrappedCheck = arrayToPositionsHelper(check);

  jsc.assert(jsc.forall(arbitraryPositionsPair, wrappedCheck));
  t.end();
});

tap.test("handles identical set of answered statements", function(t) {
  // Ensure equal length, to have identical sets of answered statements
  let arbitraryPositionsPair = jsc.suchthat(
    jsc.pair(arbitraryPositions, arbitraryPositions),
    ([a, b]) => a.length === b.length
  );

  function check([a, b]) {
    let d = distance(a, b);

    return d <= 1 && d >= 0;
  }

  let wrappedCheck = arrayToPositionsHelper(check);

  jsc.assert(jsc.forall(arbitraryPositionsPair, wrappedCheck));
  t.end();
});

tap.test("handles uneven number of answered statements", function(t) {
  // Ensure un-even length.
  let arbitraryPositionsPair = jsc.suchthat(
    jsc.pair(arbitraryPositions, arbitraryPositions),
    ([a, b]) => a.length !== b.length
  );

  function check([a, b]) {
    let d = distance(a, b);

    return d <= 1 && d >= 0;
  }

  let wrappedCheck = arrayToPositionsHelper(check);

  jsc.assert(jsc.forall(arbitraryPositionsPair, wrappedCheck));
  t.end();
});

// Example based tests
tap.test("both empty", function(t) {
  let a = {};
  let b = {};

  t.ok(distance(a, b) === 0);
  t.end();
});

tap.test("left-empty", function(t) {
  let a = positionsMock({ n: 2 });
  let b = {};

  t.ok(distance(a, b) === 0);
  t.end();
});

tap.test("right-empty", function(t) {
  let a = {};
  let b = positionsMock({ n: 2 });

  t.ok(distance(a, b) === 0);
  t.end();
});

tap.test("left just-0s", function(t) {
  let n = 2;
  let a = positionsMock({ n, positionMock: () => 0 });
  let b = positionsMock({ n });

  t.ok(distance(a, b) === 0);
  t.end();
});

tap.test("right just-0s", function(t) {
  let n = 2;
  let a = positionsMock({ n });
  let b = positionsMock({ n, positionMock: () => 0 });

  t.ok(distance(a, b) === 0);
  t.end();
});

tap.test("both just-0s", function(t) {
  let n = 2;
  let a = positionsMock({ n, positionMock: () => 0 });
  let b = positionsMock({ n, positionMock: () => 0 });

  t.ok(distance(a, b) === 0);
  t.end();
});

tap.test("left not answered", function(t) {
  let a = toPositions([[0, -2], [1, 1], [2, 2]]);
  let b = toPositions([[0, 1], [1, 1], [2, 0]]);

  t.ok(distance(a, b) === (8 - 3) / 8);
  t.end();
});

tap.test("left missing", function(t) {
  let a = toPositions([[0, -2], [1, 1], [2, 2]]);
  let b = toPositions([[0, 1], [1, 1]]);

  t.ok(distance(a, b) === (8 - 3) / 8);
  t.end();
});

tap.test("right not answered", function(t) {
  let a = toPositions([[0, 1], [1, 1], [2, 0]]);
  let b = toPositions([[0, -2], [1, 1], [2, 2]]);

  t.ok(distance(a, b) === (8 - 3) / 8);
  t.end();
});

tap.test("right missing", function(t) {
  let a = toPositions([[0, 1], [1, 1]]);
  let b = toPositions([[0, -2], [1, 1], [2, 2]]);

  t.ok(distance(a, b) === (8 - 3) / 8);
  t.end();
});

tap.test("both not answered", function(t) {
  let a = toPositions([[0, 1], [1, 1], [2, 0], [3, -1]]);
  let b = toPositions([[0, -2], [1, 1], [2, 2], [3, 0]]);

  t.ok(distance(a, b) === (8 - 3) / 8);
  t.end();
});

tap.test("both missing", function(t) {
  let a = toPositions([[0, 1], [1, 1], [3, -1]]);
  let b = toPositions([[0, -2], [1, 1], [2, 2]]);

  t.ok(distance(a, b) === (8 - 3) / 8);
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
    ["3", positionMock()],
    ["8", positionMock()],
    ["16", positionMock()],
    ["23", positionMock()],
    ["38", positionMock()],
    ["42", positionMock()],
    ["63", positionMock()],
    ["64", positionMock()],
    ["71", positionMock()],
    ["142", positionMock()],
    ["222", positionMock()],
    ["391", positionMock()],
    ["411", positionMock()],
    ["432", positionMock()],
    ["442", positionMock()]
  ];
  let a = toPositions(left);
  let b = toPositions(voter);

  let distanceA = distance(a, b);
  let distanceB = distance(b, a);

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
    ["3", positionMock()],
    ["8", positionMock()],
    ["16", positionMock()],
    ["23", positionMock()],
    ["38", positionMock()],
    ["42", positionMock()],
    ["63", positionMock()],
    ["64", positionMock()],
    ["71", positionMock()],
    ["142", positionMock()],
    ["222", positionMock()],
    ["391", positionMock()],
    ["411", positionMock()],
    ["432", positionMock()],
    ["442", positionMock()]
  ];
  let a = toPositions(centre);
  let b = toPositions(voter);

  let distanceA = distance(a, b);
  let distanceB = distance(b, a);

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
    ["3", positionMock()],
    ["8", positionMock()],
    ["16", positionMock()],
    ["23", positionMock()],
    ["38", positionMock()],
    ["42", positionMock()],
    ["63", positionMock()],
    ["64", positionMock()],
    ["71", positionMock()],
    ["142", positionMock()],
    ["222", positionMock()],
    ["391", positionMock()],
    ["411", positionMock()],
    ["432", positionMock()],
    ["442", positionMock()]
  ];
  let a = toPositions(right);
  let b = toPositions(voter);

  let distanceA = distance(a, b);
  let distanceB = distance(b, a);

  t.ok(distanceA === distanceB);
  t.end();
});

tap.test("readme example", function(t) {
  let a = toPositions([[0, 1], [1, -1]]);
  let b = toPositions([[0, 0], [1, -2]]);

  t.ok(distance(a, b) === 0.75);
  t.end();
});

tap.test("distanceMap", function(t) {
  tap.test("result includes all ids passed", function(t) {
    let map = {
      1: toPositions([[0, 1], [1, -1]]),
      2: toPositions([[0, 2], [1, -2]])
    };

    let a = toPositions([[0, 1], [1, -2]]);

    let distances = distanceMap(a, map);

    t.same(Object.keys(map), Object.keys(distances));
    t.end();
  });

  tap.test("result include actual distances", function(t) {
    let b1 = toPositions([[0, 1], [1, -1]]);
    let b2 = toPositions([[0, 2], [1, -2]]);
    let map = { 1: b1, 2: b2 };

    let a = toPositions([[0, 1], [1, -2]]);

    let distances = distanceMap(a, map);

    t.ok(distances[1] === distance(a, b1));
    t.ok(distances[2] === distance(a, b2));
    t.end();
  });

  t.end();
});

tap.test("distanceMix", function(t) {
  tap.test("actual ratio is less than max ratio", function(t) {
    let a = toPositions([[0, 1], [1, -2], [2, 2], [3, -2], [4, -1]]);
    let b1 = toPositions([[0, 1]]);
    let b2 = toPositions([[1, 2], [2, -2], [3, -2], [4, -2]]);

    let ratio = 0.3;

    let d = distanceMix(a, b1, ratio, b2);
    let dab1 = distance(a, b1);
    let dab2 = distance(a, b2);

    t.ok(d === 0.2 * dab1 + 0.8 * dab2);
    t.end();
  });

  tap.test("actual ratio is larger than max ratio", function(t) {
    let a = toPositions([[0, 1], [1, -2], [2, 2], [3, -2], [4, -1]]);
    let b1 = toPositions([[0, 1], [1, 2]]);
    let b2 = toPositions([[2, -2], [3, -2], [4, -2]]);

    let ratio = 0.3;

    let d = distanceMix(a, b1, ratio, b2);
    let dab1 = distance(a, b1);
    let dab2 = distance(a, b2);

    t.ok(d === ratio * dab1 + (1 - ratio) * dab2);
    t.end();
  });

  tap.test("actual ratio is less than max ratio with skips", function(t) {
    let a = toPositions([[-1, 0], [0, 1], [1, -2], [2, 2], [3, -2], [4, -1]]);
    let b1 = toPositions([[-1, 1], [0, 1]]);
    let b2 = toPositions([[1, 2], [2, -2], [3, -2], [4, -2]]);

    let ratio = 0.3;

    let d = distanceMix(a, b1, ratio, b2);
    let dab1 = distance(a, b1);
    let dab2 = distance(a, b2);

    t.ok(d === 0.2 * dab1 + 0.8 * dab2);
    t.end();
  });

  tap.test("actual ratio is larger than max ratio with skips", function(t) {
    let a = toPositions([[0, 1], [1, 0], [2, 0], [3, -2], [4, -1]]);
    let b1 = toPositions([[0, 1]]);
    let b2 = toPositions([[1, 2], [2, -2], [3, -2], [4, -2]]);

    let ratio = 0.3;

    let d = distanceMix(a, b1, ratio, b2);
    let dab1 = distance(a, b1);
    let dab2 = distance(a, b2);

    t.ok(d === ratio * dab1 + (1 - ratio) * dab2);
    t.end();
  });

  tap.test("actual ratio is 0 should prioritize the other set", function(t) {
    let a = toPositions([[0, 0], [1, 0], [2, 0], [3, -2], [4, -1]]);
    let b1 = toPositions([[0, 1]]);
    let b2 = toPositions([[1, 2], [2, -2], [3, -2], [4, -2]]);

    let ratio = 0.3;

    let d = distanceMix(a, b1, ratio, b2);
    let dab2 = distance(a, b2);

    t.ok(d === dab2);
    t.end();
  });

  tap.test("actual ratio is 1 should still only get max ratio", function(t) {
    let a = toPositions([[0, 1], [1, 0], [2, 0], [3, 0], [4, 0]]);
    let b1 = toPositions([[0, 1]]);
    let b2 = toPositions([[1, 2], [2, -2], [3, -2], [4, -2]]);

    let ratio = 0.3;

    let d = distanceMix(a, b1, ratio, b2);
    let dab1 = distance(a, b1);

    t.ok(d === ratio * dab1);
    t.end();
  });

  tap.test("doesn't affect identical positions", function(t) {
    let a = toPositions([[0, 1], [1, 2], [2, -2], [3, -2], [4, -2]]);
    let b1 = toPositions([[0, 1]]);
    let b2 = toPositions([[1, 2], [2, -2], [3, -2], [4, -2]]);

    let ratio = 0.3;

    t.ok(distanceMix(a, b1, ratio, b2) === 1.0);
    t.end();
  });

  tap.test("ratios less than max is same as distance", function(t) {
    let arguments = jsc.suchthat(
      jsc.pair(
        arbitraryPositions,
        jsc.pair(arbitraryPositions, arbitraryPositions)
      ),
      ([a, [b, c]]) =>
        Math.floor(0.3 * a.length) === b.length &&
        Math.ceil(0.7 * a.length) === c.length &&
        b.length > 2
    );

    function check([arrA, [arrB, arrC]]) {
      let a = toPositions(arrA.map((v, i) => [i, v]));
      let b = toPositions(arrB.map((v, i) => [i, v]));
      let c = toPositions(arrC.map((v, i) => [i + arrB.length, v]));

      let ratio = 0.3;

      let mixedDistance = distanceMix(a, b, ratio, c);
      let nonMixedDistance = distance(a, { ...b, ...c });

      return mixedDistance.toFixed(2) === nonMixedDistance.toFixed(2);
    }

    jsc.assert(jsc.forall(arguments, check));
    t.end();
  });

  t.end();
});
