type PositionValue = -2 | -1 | 1 | 2;

type Positions = {
  [key: string]: { value: PositionValue | null };
};

type PositionsMap<T extends string> = Record<T, Positions>;

export function proximity(positionsA: Positions, positionsB: Positions): number;
export function proximityMap<T extends string>(
  positionsA: Positions,
  positionsMap: PositionsMap<T>
): Record<T, number>;
