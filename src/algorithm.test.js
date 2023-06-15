const tap = require("tap");
const jsc = require("jsverify");

const { distance, distanceMap } = require("./algorithm.js");
const { toPositions } = require("./domain/positions.js");
const {
  positions: positionsMock,
  position: positionMock,
} = require("./__helpers/mocks.js");

function arrayToPositionsHelper(check) {
  // The order of keys is not really interesing here,
  // but needed for the algorithm to do its thing.
  return function(vectors) {
    let args = vectors
      .map((vector) => vector.map((v, i) => [i, v]))
      .map((vector) => toPositions(vector));

    return check(args);
  };
}

let arbitraryPositions = jsc.array(jsc.number(-2, 2));

// Property based tests

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
    return distance(a, b) === null;
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

  t.ok(distance(a, b) === null);
  t.end();
});

tap.test("left-empty", function(t) {
  let a = positionsMock({ n: 2 });
  let b = {};

  t.ok(distance(a, b) === null);
  t.end();
});

tap.test("right-empty", function(t) {
  let a = {};
  let b = positionsMock({ n: 2 });

  t.ok(distance(a, b) === null);
  t.end();
});

tap.test("left just-0s", function(t) {
  let n = 2;
  let a = positionsMock({ n, positionMock: () => null });
  let b = positionsMock({ n });

  t.ok(distance(a, b) === null);
  t.end();
});

tap.test("right just-0s", function(t) {
  let n = 2;
  let a = positionsMock({ n });
  let b = positionsMock({ n, positionMock: () => null });

  t.ok(distance(a, b) === null);
  t.end();
});

tap.test("both just-0s", function(t) {
  let n = 2;
  let a = positionsMock({ n, positionMock: () => null });
  let b = positionsMock({ n, positionMock: () => null });

  t.ok(distance(a, b) === null);
  t.end();
});

tap.test("left not answered", function(t) {
  let a = toPositions([[0, -2], [1, 1], [2, 2]]);
  let b = toPositions([[0, 1], [1, 1], [2, null]]);

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
  let a = toPositions([[0, 1], [1, 1], [2, null]]);
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
  let a = toPositions([[0, 1], [1, 1], [2, null], [3, -1]]);
  let b = toPositions([[0, -2], [1, 1], [2, 2], [3, null]]);

  t.ok(distance(a, b) === (8 - 3) / 8);
  t.end();
});

tap.test("both missing", function(t) {
  let a = toPositions([[0, 1], [1, 1], [3, -1]]);
  let b = toPositions([[0, -2], [1, 1], [2, 2]]);

  t.ok(distance(a, b) === (8 - 3) / 8);
  t.end();
});

tap.test("values near 0 are treated as being twice as far away", function(t) {
  let a = toPositions([[0, 0], [1, 0]]);
  let b = toPositions([[0, 1], [1, -1]]);

  t.ok(distance(a, b) === 0.5);
  t.end();
});

tap.test("values near 0 cannot get more than the max distance", function(t) {
  let a = toPositions([[0, -0.3], [1, 0.3]]);
  let b = toPositions([[0, 2], [1, -2]]);

  t.ok(distance(a, b) === 0.0);
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
    ["442", 0.25],
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
    ["442", positionMock()],
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
    ["442", 0.66],
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
    ["442", positionMock()],
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
    ["442", -1],
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
    ["442", positionMock()],
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
  let b = toPositions([[0, -2], [1, 2]]);

  t.ok(distance(a, b) === 0.25);
  t.end();
});

tap.test("distanceMap", function(t) {
  tap.test("result includes all ids passed", function(t) {
    let map = {
      1: toPositions([[0, 1], [1, -1]]),
      2: toPositions([[0, 2], [1, -2]]),
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

  tap.test("can modify distances using weights", function(t) {
    let b1 = toPositions([[0, 1], [1, -1]]);
    let b2 = toPositions([[0, 2], [1, -2]]);
    let map = { 1: b1, 2: b2 };

    let a = toPositions([[0, 1], [1, -2]]);

    let w = 1.05;
    let distances = distanceMap(a, map, { 1: w });

    t.ok(distances[1] === w * distance(a, b1));
    t.end();
  });

  tap.test("can modify distances using 0 weights", function(t) {
    let b1 = toPositions([[0, 1], [1, -1]]);
    let b2 = toPositions([[0, 2], [1, -2]]);
    let map = { 1: b1, 2: b2 };

    let a = toPositions([[0, 1], [1, -2]]);

    let w = 0;
    let distances = distanceMap(a, map, { 1: w });

    t.ok(distances[1] === w * distance(a, b1));
    t.end();
  });

  tap.test("cannot make distance larger than 1", function(t) {
    let b1 = toPositions([[0, 1], [1, -1]]);
    let b2 = toPositions([[0, 2], [1, -2]]);
    let map = { 1: b1, 2: b2 };

    let a = b1;

    let w = 1.05;
    let distances = distanceMap(a, map, { 1: w });

    t.ok(distances[1] === 1.0);
    t.end();
  });

  t.end();
});
