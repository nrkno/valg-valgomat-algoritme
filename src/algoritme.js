function zeroVector(statementVector) {
  return statementVector.filter(([id, verdi]) => verdi === 0);
}

function findIdIn(statementToFind, statementVector) {
  return statementVector.find(statement => statementToFind[0] === statement[0]);
}

function existsIn(el, statementVector) {
  return !!findIdIn(el, statementVector);
}

function subtractStatements(statementsToSubtract, statementVector) {
  return statementVector.filter(el => !existsIn(el, statementsToSubtract));
}

function zipById(statementVectorA, statementVectorB) {
  let pairs = [];

  for (let i = 0; i < statementVectorA.length; i++) {
    let statementA = statementVectorA[i];
    let statementB = findIdIn(statementA, statementVectorB);
    pairs.push([statementA[1], statementB[1]]);
  }

  return pairs;
}

function difference([a, b]) {
  return Math.abs(a - b);
}

function sum(s, v) {
  return s + v;
}

function min(arr) {
  return arr.reduce((min, v) => (v < min ? v : min));
}

function max(arr) {
  return arr.reduce((max, v) => (v > max ? v : max));
}

function answerToStatementVector(answer) {
  return Object.keys(answer).map(statementId => [statementId, parseInt(answer[statementId].value, 10)]);
}

function formatStatementError(statementId, cause) {
  return `Invalid answer for statement ${statementId}: ${cause}`;
}

const POSSIBLE_ANSWERS = [0, 1, 2, -1, -2];
const MAX_DIST = Math.abs(max(POSSIBLE_ANSWERS) - min(POSSIBLE_ANSWERS));

function validateStatementAnswers(answer) {
  function validateStatementAnswer(statementId) {
    let currentStatement = answer[statementId];

    if (POSSIBLE_ANSWERS.indexOf(parseInt(currentStatement.value, 10)) < 0) {
      throw new Error(
        formatStatementError(
          statementId,
          `${currentStatement.value} not in [${POSSIBLE_ANSWERS.join(",")}]`
        )
      );
    }
  }

  Object.keys(answer).forEach(validateStatementAnswer);
}

function validateUserAnswer(userAnswer, partyAnswer) {
  validateStatementAnswers(userAnswer);

  let partyStatementIds = Object.keys(partyAnswer);
  let userStatementIds = Object.keys(userAnswer);

  userStatementIds.forEach(function(id) {
    if (partyStatementIds.indexOf(id) < 0) {
      throw new Error(
        formatStatementError(id, `Statement not answered by party`)
      );
    }
  });
}

function validatePartyAnswer(partyAnswer) {
  validateStatementAnswers(partyAnswer);

  let partyStatementIds = Object.keys(partyAnswer);

  partyStatementIds.forEach(function(id) {
    let value = partyAnswer[id].value;
    if (value === 0 || value === "0") {
      throw new Error(
        formatStatementError(
          id,
          `Parties must answer all statements. 0 not allowed.`
        )
      );
    }
  });
}

function closeness(partyAnswer, userAnswer) {
  validateUserAnswer(userAnswer, partyAnswer);
  validatePartyAnswer(partyAnswer);

  let userStatementVector = answerToStatementVector(userAnswer);
  let partyStatementVector = answerToStatementVector(partyAnswer);

  let notAnsweredVector = zeroVector(userStatementVector);
  let subractNotAnswered = subtractStatements.bind(null, notAnsweredVector);

  let answeredPartyStatements = subractNotAnswered(partyStatementVector);
  let answeredUserStatements = subractNotAnswered(userStatementVector);

  if (answeredUserStatements.length === 0) {
    // NOTE:
    // This is technically wrong, but in line with old algorithm.
    // Normally, an empty vector would get a closeness of 100%,
    // since the difference between [] and [] is 0.
    // This is not a common case, but kept for historical reasons.
    return 0;
  }

  let distance = zipById(answeredUserStatements, answeredPartyStatements)
    .map(difference)
    .reduce(sum);

  let maxPossibleDistance = answeredUserStatements.length * MAX_DIST;

  return (maxPossibleDistance - distance) / maxPossibleDistance;
}

module.exports = {
  closeness
};
