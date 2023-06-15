const {
  toVector,
  removeNotAnswered,
  toStatementSet,
  commonStatements,
} = require("./domain/positions.js");

const { pipe } = require("./domain/functions.js");

const MIN_POSITION = -2;
const MAX_POSITION = 2;
const MAX_DIST = Math.abs(MAX_POSITION - MIN_POSITION);

function combineBy(statements, positionsA, positionsB) {
  return statements.map(function(statementId) {
    let a = positionsA[statementId];
    let b = positionsB[statementId];

    return [a.value, b.value];
  });
}

function closeTo0(a) {
  return a >= -0.3 && a <= 0.3;
}

function differenceWith0Handling(a, b) {
  // XOR
  if ((closeTo0(a) || closeTo0(b)) && !(closeTo0(a) && closeTo0(b))) {
    let difference = 2 * Math.abs(a - b);
    return difference <= MAX_DIST ? difference : MAX_DIST;
  } else {
    return Math.abs(a - b);
  }
}

function distanceGivenStatements(statements, positionsA, positionsB) {
  if (statements.length === 0) {
    // NOTE:
    // This is technically wrong, but in line with old algorithm.
    // Normally, an empty vector would get a distance of 0%,
    // since the difference between {} and {} is 0.
    // This is not a common case, but kept for historical reasons.
    return 0;
  }

  let distance = combineBy(statements, positionsA, positionsB)
    .map(([a, b]) => differenceWith0Handling(a, b))
    .reduce((sum, value) => sum + value);

  let maxPossibleDistance = statements.length * MAX_DIST;

  return (maxPossibleDistance - distance) / maxPossibleDistance;
}

function distance(positionsA, positionsB) {
  let processPositions = pipe(
    toVector,
    removeNotAnswered,
    toStatementSet
  );

  let statementsA = processPositions(positionsA);
  let statementsB = processPositions(positionsB);

  let answeredStatements = commonStatements(statementsA, statementsB);

  return distanceGivenStatements(answeredStatements, positionsA, positionsB);
}

function distanceMap(positionsA, positionsMap, weights = {}) {
  let result = {};
  for (let id in positionsMap) {
    let positionsB = positionsMap[id];
    let weight = weights[id] != null ? weights[id] : 1;
    let weightedDistance = weight * distance(positionsA, positionsB);
    result[id] = weightedDistance >= 1.0 ? 1.0 : weightedDistance;
  }

  return result;
}

module.exports = {
  distance,
  distanceMap,
};
