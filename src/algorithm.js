import { commonStatements } from './domain/positions.js'

/** @type {ValgomatAlgoritme.PositionValue} */
const MIN_POSITION = -2
/** @type {ValgomatAlgoritme.PositionValue} */
const MAX_POSITION = 2
const MAX_DIST = Math.abs(MAX_POSITION - MIN_POSITION)

/**
 * @param {string[]} statements
 * @param {ValgomatAlgoritme.Positions} positionsA
 * @param {ValgomatAlgoritme.Positions} positionsB
 * @returns {[ValgomatAlgoritme.PositionValue, ValgomatAlgoritme.PositionValue][]}
 */
function combineBy(statements, positionsA, positionsB) {
  return statements.map(function (statementId) {
    // NOTE: These casts are safe because we always call this with `statements`
    // being the set of common statements between the two positions.
    let a = /** @type {ValgomatAlgoritme.PositionValue} */ (positionsA[statementId])
    let b = /** @type {ValgomatAlgoritme.PositionValue} */ (positionsB[statementId])

    return [a, b]
  })
}

/**
 * @param {ValgomatAlgoritme.PositionValue} a
 * @param {ValgomatAlgoritme.PositionValue} b
 * @returns
 */
function difference(a, b) {
  return Math.abs(a - b)
}

/**
 * @param {string[]} statements
 * @param {ValgomatAlgoritme.Positions} positionsA
 * @param {ValgomatAlgoritme.Positions} positionsB
 * @returns {number | null}
 */
function distanceGivenStatements(statements, positionsA, positionsB) {
  if (statements.length === 0) {
    // NOTE: If there are no statements, the difference would be unknowable. So
    // we return null in this case. This used to return 0 for historical
    // reasons, but this reason is no longer valid and we need to distinguish
    // between furthest apart (0% common) and unknown.
    return null
  }

  let distance = combineBy(statements, positionsA, positionsB)
    .map(([a, b]) => difference(a, b))
    .reduce((sum, value) => sum + value)

  let maxPossibleDistance = statements.length * MAX_DIST

  return (maxPossibleDistance - distance) / maxPossibleDistance
}

/** @type {import('../types.d.ts').proximity} */
export function proximity(positionsA, positionsB) {
  let answeredStatements = commonStatements(positionsA, positionsB)

  return distanceGivenStatements(answeredStatements, positionsA, positionsB)
}

/** @type {import('../types.d.ts').proximityMap} */
export function proximityMap(positionsA, positionsMap) {
  let result = /** @type {Record.<string, number|null>} */ ({})
  for (let id in positionsMap) {
    let positionsB = positionsMap[id]
    let calculatedDistance = proximity(positionsA, positionsB)
    result[id] = calculatedDistance
  }

  return result
}
