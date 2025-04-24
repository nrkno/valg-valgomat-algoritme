export type PositionValue = -2 | -1 | 1 | 2

export type Positions = {
  [key: string]: { value: PositionValue | null }
}

export type PositionsMap<T extends string> = Record<T, Positions>

export type PositionVector = [string, PositionValue | null]

export as namespace ValgomatAlgoritme
