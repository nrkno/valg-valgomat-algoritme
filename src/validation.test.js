const tap = require("tap");

const {
  validatePositions,
  validatePositionsTaken,
  validateOverlappingPositions,
} = require("./validation.js");
const { toPositions } = require("./domain/positions.js");

const { positions: positionsMock } = require("./__helpers/mocks.js");

tap.test("validatePositions", function(t) {
  t.test("returns null for valid positions", function(t) {
    let positions = toPositions([[0, -2], [1, -1], [2, 0], [3, 1], [4, 2]]);

    t.ok(validatePositions(positions) == null);
    t.end();
  });

  t.test("returns error for invalid positions", function(t) {
    let positions = positionsMock({ n: 5, positionMock: () => 3 });

    t.ok(validatePositions(positions) != null);
    t.end();
  });

  t.end();
});

tap.test("validatePositionTaken", function(t) {
  t.test("returns null for taken positions", function(t) {
    let positions = positionsMock({ n: 5 });

    t.ok(validatePositionsTaken(positions) == null);
    t.end();
  });

  t.test("returns error for positions not taken", function(t) {
    let positions = positionsMock({ n: 5, positionMock: () => 0 });

    t.ok(validatePositionsTaken(positions) != null);
    t.end();
  });

  t.test("returns error for positions missing (invalid value)", function(t) {
    let positions = positionsMock({ n: 5, positionMock: () => null });

    t.ok(validatePositionsTaken(positions) != null);
    t.end();
  });

  t.test("returns error for positions missing", function(t) {
    let positions = { 0: null };

    t.ok(validatePositionsTaken(positions) != null);
    t.end();
  });

  t.end();
});

tap.test("validateOverlappingPositions", function(t) {
  t.test("returns null for overlapping positions", function(t) {
    let positionsA = positionsMock({ n: 5 });
    let positionsB = positionsMock({ n: 5 });

    t.ok(validateOverlappingPositions(positionsA, positionsB) == null);
    t.end();
  });

  t.test("returns error for non-overlapping positions", function(t) {
    let positionsA = toPositions([[0, 1], [1, 1]]);
    let positionsB = toPositions([[0, 1], [2, 1]]);

    t.ok(validateOverlappingPositions(positionsA, positionsB) != null);
    t.end();
  });

  t.end();
});
