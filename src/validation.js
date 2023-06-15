const { toVector, toStatementSet } = require("./domain/positions.js");

const { pipe } = require("./domain/functions.js");

const POSSIBLE_ANSWERS = [0.0, 1.0, 2.0, -1.0, -2.0];

function formatErrors(errors) {
  return errors
    .map(function([statementId, error]) {
      return `[Validation] ${statementId}: ${error}`;
    })
    .join("\n");
}

function validateStatementPosition(statement) {
  let position = parseFloat(statement.value);
  if (!POSSIBLE_ANSWERS.includes(position)) {
    return `Expected position ${position} to be one of [${POSSIBLE_ANSWERS}]`;
  }
}

function validatePositionTaken(statement) {
  let message = `Expected position to not be 0`;
  if (!statement) return message;

  let position = parseFloat(statement.value);
  if (isNaN(position) || position === 0) {
    return message;
  }
}

function mapPositions(fn, positions) {
  return Object.keys(positions)
    .map(function(statementId) {
      let position = positions[statementId];
      return [statementId, fn(position)];
    })
    .filter(([, value]) => !!value);
}

function validatePositions(positions) {
  let errors = mapPositions(validateStatementPosition, positions);

  return errors.length > 0 ? formatErrors(errors) : null;
}

function validatePositionsTaken(positions) {
  let errors = mapPositions(validatePositionTaken, positions);

  return errors.length > 0 ? formatErrors(errors) : null;
}

function validateOverlappingPositions(positionsA, positionsB) {
  let processPositions = pipe(
    toVector,
    toStatementSet
  );

  let statementsA = processPositions(positionsA);
  let statementsB = processPositions(positionsB);

  let allOverlapping = statementsA
    .map((id) => statementsB.includes(id))
    .concat(statementsB.map((id) => statementsA.includes(id)))
    .reduce((acc, v) => acc && v);

  if (!allOverlapping) {
    return `[Validation]: `;
  }
}

module.exports = {
  validatePositions,
  validatePositionsTaken,
  validateOverlappingPositions,
};
