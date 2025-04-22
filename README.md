# Valgomat algorithm

> Calculate the proximity of two sets of positions.

Calculates the proximity of two sets of positions. Mostly used to calculate the proximity of various party positions and a voter position.

## Usage

The simple case is comparing to sets of positions.

```js
import { proximity } from "@nrk/valg-valgomat-algoritme";

let partyPositions = {
  "1": { value: 1 },
  "2": { value: -1 },
};

let voterPositions = {
  "1": { value: -2 },
  "2": { value: 2 },
};

let p = proximity(partyPositions, voterPositions); // => 0.25
```

The module also comes with a function to compare many positions to one position.

```js
import { proximityMap } from "@nrk/valg-valgomat-algoritme";

let partyAPositions = {
  "1": { value: 1 },
  "2": { value: -1 },
};

let partyBPositions = {
  "1": { value: 2 },
  "2": { value: -2 },
};

let partyPostitions = {
  partyA: partyAPositions,
  partyB: partyBPositions,
};

let voterPositions = {
  "1": { value: null },
  "2": { value: -2 },
};

let optionalWeights = {
  partyA: 1.0,
  partyB: 1.0,
};

let proximities = proximityMap(voterPositions, partyPositions, optionalWeights);
// => { "partyA": 0.75, "partyB": 1.0 }
```

## API

```js
import { proximity, proximityMap } from "@nrk/valg-valgomat-algoritme";
```

### let d = proximity(positionsA, positionsB);

Accepts two sets of positions and returns the proximity between them.

Positions are given in the form of sets:

```ts
{
  [statement: string]: { value: number }
}
```

Where `value` is in the interval `[-2.0, 2.0]`

Output will be a number in the interval `[0.0, 1.0]` where `0.0` is the furthest away and `1.0` is the closest possible proximity (iow. identical).

If we are unable to determine a proximity, the output will be `null`. This happens if we are comparing a pair of vectors where one of the vectors are empty.

If a `value` is close to `0` (currently defined as `+/-0.3`), it will be handled as a special case and given twice the distance to a value that is not close to `0`. I.e. the distance between `0.1` and `1.0` will become `1.8`.

This is done to more accuratly represent the situation where a party, voter or model party is taking a position close to `0`. Such a position is considered as a completely unknown position, it could go either way when one is forced to consider it. Comparing moderate positions (`-1/1`) to this unknown position would be unreasonably favorable if we hadn't implemented this mechanism.

### let proximities = proximityMap(positionsA, positionsMap, optionalWeights = {});

Accepts a set of positions and a map of many sets of positions and returns a map of the proximities between a position in the position map and the first position. Optionally provide weights for keys in `positionsMap`, will multiply `proximity` with `weight` for that key.

This is useful if you want to calculate the proximity of one set of positions and many sets of positions. For instance between all parties and a single voter.

Output will be a map from the keys in the positionsMap and the proximity to the given position.

## Extra

See [validation](./validation.md) or [tools](./tools.md) for documentation on some of the extra features of this pacakge.

## Installation

```sh
npm install @nrk/valg-valgomat-algoritme
```

## Glossary

- Position = Standpunkt
- Statement = Påstand
- Party = Parti
- Voter = Velger

## A note on codestyle

This module uses default configuration of Prettier.

This module uses CommonJS/Node-style `require` for broadest possible ecosystem-compatbility without additional compile-steps.

This module uses a fairly modern flavor of JavaScript and will require compilation if it is to be used with older runtimes.

## See also

- [valg-valgomat](https://github.com/nrkno/valg-valgomat)
