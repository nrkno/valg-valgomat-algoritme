function toVector(positions) {
  return Object.keys(positions).map(function(statementId) {
    return [statementId, parseFloat(positions[statementId].value)];
  });
}

function toPositions(vector) {
  return vector.reduce((positions, [id, value]) => {
    positions[id] = { value };
    return positions;
  }, {});
}

function removeNotAnswered(vector) {
  return vector.filter(function([, position]) {
    return !isNaN(position);
  });
}

function toStatementSet(vector) {
  return vector.map(([id]) => id);
}

function commonStatements(statementSetA, statementSetB) {
  return statementSetA.filter((id) => statementSetB.includes(id));
}

module.exports = {
  toVector,
  toPositions,
  removeNotAnswered,
  toStatementSet,
  commonStatements,
};
