const {
  toVector,
  removeNotAnswered,
  toStatementSet,
  commonStatements
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
    .map(([a, b]) => Math.abs(a - b))
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

function distanceMix(positionsA, positionsB1, maxRatioAB1, positionsB2) {
  let processPositions = pipe(
    toVector,
    removeNotAnswered,
    toStatementSet
  );

  let statementsA = processPositions(positionsA);
  let statementsB1 = processPositions(positionsB1);
  let statementsB2 = processPositions(positionsB2);

  let answeredStatementsAB1 = commonStatements(statementsA, statementsB1);
  let answeredStatementsAB2 = commonStatements(statementsA, statementsB2);

  let distanceAB1 = distanceGivenStatements(
    answeredStatementsAB1,
    positionsA,
    positionsB1
  );

  let distanceAB2 = distanceGivenStatements(
    answeredStatementsAB2,
    positionsA,
    positionsB2
  );

  let totalNumberOfStatements =
    answeredStatementsAB1.length + answeredStatementsAB2.length;
  let actualRatioAB1 = answeredStatementsAB1.length / totalNumberOfStatements;

  if (actualRatioAB1 < maxRatioAB1) {
    return actualRatioAB1 * distanceAB1 + (1 - actualRatioAB1) * distanceAB2;
  } else {
    return maxRatioAB1 * distanceAB1 + (1 - maxRatioAB1) * distanceAB2;
  }
}

module.exports = {
  distance,
  distanceMap,
  distanceMix
};
