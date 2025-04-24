# Valgomat algorithm

> Calculate the proximity of two sets of positions.

Calculates the proximity of two sets of positions. Mostly used to calculate the proximity of various party positions and a voter position.

## Usage

The simple case is comparing to sets of positions.

```js
import { proximity } from '@nrk/valg-valgomat-algoritme'

let partyPositions = {
  1: { value: 1 },
  2: { value: -1 },
}

let voterPositions = {
  1: { value: -2 },
  2: { value: 2 },
}

let p = proximity(partyPositions, voterPositions)
// => 0.25
```

The module also comes with a function to compare many positions to one position.

```js
import { proximityMap } from '@nrk/valg-valgomat-algoritme'

let partyAPositions = {
  1: { value: 1 },
  2: { value: -1 },
}

let partyBPositions = {
  1: { value: 2 },
  2: { value: -2 },
}

let partyPostitions = {
  partyA: partyAPositions,
  partyB: partyBPositions,
}

let voterPositions = {
  1: { value: null },
  2: { value: -2 },
}

let proximities = proximityMap(voterPositions, partyPositions)
// => { "partyA": 0.75, "partyB": 1.0 }
```

## API

```js
import { proximity, proximityMap } from '@nrk/valg-valgomat-algoritme'
```

### let d = proximity(positionsA, positionsB);

Accepts two sets of positions and returns the proximity between them.

Positions are given in the form of sets:

```ts
{
  [statement: string]: { value: -2 | -1 | 1 | -2 | null }
}
```

Where `value` is in the interval `[-2.0, 2.0]`

Output will be a number in the interval `[0.0, 1.0]` where `0.0` is the furthest away and `1.0` is the closest possible proximity (iow. identical).

If we are unable to determine a proximity, the output will be `null`. This happens if we are comparing a pair of vectors where one of the vectors are empty or there are no overlapping statements.

### let proximities = proximityMap(positionsA, positionsMap);

Accepts a set of positions and a map of many sets of positions and returns a map of the proximities between a position in the position map and the first position.

This is useful if you want to calculate the proximity of one set of positions and many sets of positions. For instance between all parties and a single voter.

Output will be a map from the keys in the positionsMap and the proximity to the given position.

## Installation

```sh
npm install @nrk/valg-valgomat-algoritme
```

## Glossary

- Position = Standpunkt
- Statement = Påstand
- Party = Parti
- Voter = Velger
