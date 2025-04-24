import { toPositions } from '../domain/positions.js'

/**
 * Function that generates a random position among the valid positions
 * @returns {ValgomatAlgoritme.PositionValue}
 */
export function position() {
  /** @type {[-2, -1, 1, 2]} */
  let values = [-2, -1, 1, 2]

  return values[Math.floor(4 * Math.random())]
}

/**
 * @param {number} n
 * @param {() => (ValgomatAlgoritme.PositionValue | null)} [mockFn]
 * @returns {ValgomatAlgoritme.Positions}
 */
export function positions(n, mockFn = position) {
  return toPositions(
    Array(n)
      .fill(1)
      .map((_, i) => [`${i}`, mockFn()]),
  )
}
