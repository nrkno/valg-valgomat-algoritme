import { toPositions } from '../domain/positions.js'

export function position(lower = -2, upper = 2) {
  // NOTE: Interval is (lower, upper]
  // Doesn't need to include upper due to how the algorithm works.
  return lower + (upper - lower) * Math.random()
}

export function positions({ n, positionMock = position }) {
  return toPositions(
    Array(n)
      .fill(1)
      .map((_, i) => [i, positionMock()]),
  )
}
