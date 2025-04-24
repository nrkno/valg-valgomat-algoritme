export function proximity(
  positionsA: ValgomatAlgoritme.Positions,
  positionsB: ValgomatAlgoritme.Positions,
): number | null

export function proximityMap<T extends string>(
  positionsA: ValgomatAlgoritme.Positions,
  positionsMap: ValgomatAlgoritme.PositionsMap<T>,
): Record<T, number | null>
