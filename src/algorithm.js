const {
  toVector,
  removeNotAnswered,
  toStatementSet,
  commonStatements,
} = require('./domain/positions.js')

const { pipe } = require('./domain/functions.js')

const MIN_POSITION = -2
const MAX_POSITION = 2
const MAX_DIST = Math.abs(MAX_POSITION - MIN_POSITION)

function combineBy(statements, positionsA, positionsB) {
  return statements.map(function (statementId) {
    let a = positionsA[statementId]
    let b = positionsB[statementId]

    return [a.value, b.value]
  })
}

function difference(a, b) {
  return Math.abs(a - b)
}

function distanceGivenStatements(statements, positionsA, positionsB) {
  if (statements.length === 0) {
    // NOTE:
    // If there are no statements, the difference would be unknowable. So we
    // return null in this case. This used to return 0 for historical reasons,
    // but this reason is no longer valid and we need to distinguish between
    // furthest apart (0% common) and unknown.
    return null
  }

  let distance = combineBy(statements, positionsA, positionsB)
    .map(([a, b]) => difference(a, b))
    .reduce((sum, value) => sum + value)

  let maxPossibleDistance = statements.length * MAX_DIST

  return (maxPossibleDistance - distance) / maxPossibleDistance
}

function proximity(positionsA, positionsB) {
  let processPositions = pipe(toVector, removeNotAnswered, toStatementSet)

  let statementsA = processPositions(positionsA)
  let statementsB = processPositions(positionsB)

  let answeredStatements = commonStatements(statementsA, statementsB)

  return distanceGivenStatements(answeredStatements, positionsA, positionsB)
}

function proximityMap(positionsA, positionsMap) {
  let result = {}
  for (let id in positionsMap) {
    let positionsB = positionsMap[id]
    let calculatedDistance = proximity(positionsA, positionsB)
    result[id] = calculatedDistance
  }

  return result
}

module.exports = {
  proximity,
  proximityMap,
}
