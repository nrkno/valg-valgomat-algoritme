export function toVector(positions) {
  return Object.keys(positions).map(function (statementId) {
    return [statementId, parseFloat(positions[statementId].value)]
  })
}

export function toPositions(vector) {
  return vector.reduce((positions, [id, value]) => {
    positions[id] = { value }
    return positions
  }, {})
}

export function removeNotAnswered(vector) {
  return vector.filter(function ([, position]) {
    return !isNaN(position)
  })
}

export function toStatementSet(vector) {
  return vector.map(([id]) => id)
}

export function commonStatements(statementSetA, statementSetB) {
  return statementSetA.filter((id) => statementSetB.includes(id))
}
