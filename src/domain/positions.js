/**
 * @param {ValgomatAlgoritme.Positions} positions
 * @returns {ValgomatAlgoritme.PositionVector[]}
 */
export function toVector(positions) {
  return Object.keys(positions).map(function (statementId) {
    return [statementId, positions[statementId]]
  })
}

/**
 * @param {ValgomatAlgoritme.PositionVector[]} vector
 * @returns {ValgomatAlgoritme.Positions}
 */
export function toPositions(vector) {
  return Object.fromEntries(vector)
}

/**
 * @param {ValgomatAlgoritme.PositionVector[]} vector
 * @returns {ValgomatAlgoritme.PositionVector[]}
 */
export function removeNotAnswered(vector) {
  return vector.filter(function ([, position]) {
    return position != null && !isNaN(position)
  })
}

/**
 * @param {ValgomatAlgoritme.PositionVector[]} vector
 * @returns {string[]}
 */
export function toStatementSet(vector) {
  return vector.map(([id]) => id)
}

/**
 * @param {ValgomatAlgoritme.Positions} positions
 * @returns {string[]}
 */
function extractAnsweredStatements(positions) {
  let asVector = toVector(positions)
  let withoutNotAnswered = removeNotAnswered(asVector)

  return toStatementSet(withoutNotAnswered)
}

/**
 * @param {ValgomatAlgoritme.Positions} positionsA
 * @param {ValgomatAlgoritme.Positions} positionsB
 * @returns {string[]}
 */
export function commonStatements(positionsA, positionsB) {
  let statementsA = extractAnsweredStatements(positionsA)
  let statementsB = extractAnsweredStatements(positionsB)

  return statementsA.filter((id) => statementsB.includes(id))
}
