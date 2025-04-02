type PositionKey = string

type Positions = {
  [key: PositionKey]: { value: -2 | -1 | 0 | 1 | 2 | null | undefined }
}

export function distance(positionsA: Positions, positionsB: Positions): number
export function distanceMap<T extends string>(
  positionsA: Positions,
  positionsMap: { [key in T]: Positions },
  weights?: { [key: PositionKey]: number }
): { [key in T]: number }
