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

function distance(positionsA, positionsB) {
  let processPositions = pipe(
    toVector,
    removeNotAnswered,
    toStatementSet
  );

  let statementsA = processPositions(positionsA);
  let statementsB = processPositions(positionsB);

  let answeredStatements = commonStatements(statementsA, statementsB);

  if (answeredStatements.length === 0) {
    // NOTE:
    // This is technically wrong, but in line with old algorithm.
    // Normally, an empty vector would get a distance of 0%,
    // since the difference between [] and [] is 0.
    // This is not a common case, but kept for historical reasons.
    return 0;
  }

  let distance = combineBy(answeredStatements, positionsA, positionsB)
    .map(([a, b]) => Math.abs(a - b))
    .reduce((sum, value) => sum + value);

  let maxPossibleDistance = answeredStatements.length * MAX_DIST;

  return (maxPossibleDistance - distance) / maxPossibleDistance;
}

module.exports = {
  distance
};
