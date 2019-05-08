# Valg Valgomat Algorithm

> Calculate the distance betwen two sets of positions.

Calculates the distance between two sets of positions. Mostly used to calculate the distance between various party positions and a voter position.

## Usage

The simple case is comparing to sets of positions.

```js
import { distance } from "@nrk/valg-valgomat-algoritme";

let partyPositions = {
  "1": { value: 1 },
  "2": { value: -1 }
};

let voterPositions = {
  "1": { value: 0 },
  "2": { value: -2 }
};

let d = distance(partyPositions, voterPositions); // => 0.75
```

The module also comes with a function to compare many positions to one position.

```js
import { distanceMap } from "@nrk/valg-valgomat-algoritme";

let partyAPositions = {
  "1": { value: 1 },
  "2": { value: -1 }
};

let partyBPositions = {
  "1": { value: 2 },
  "2": { value: -2 }
};

let partyPostitions = {
  partyA: partyAPositions,
  partyB: partyBPositions
};

let voterPositions = {
  "1": { value: 0 },
  "2": { value: -2 }
};

let distances = distanceMap(voterPositions, partyPositions); // => { "partyA": 0.75, "partyB": 1.0 }
```

You can also mix distances according to some max ratio

```js
import { distanceMix } from "@nrk/valg-valgomat-algoritme";

let partyPositions = {
  "1": { value: 1 },
  "2": { value: -1 }
};

let partyLocalPositions = {
  "3": { value: 2 },
  "4": { value: -2 }
};

let voterPositions = {
  "1": { value: 0 },
  "2": { value: -2 },
  "3": { value: 2 },
  "4": { value: -2 }
};

let distance = distanceMix(
  voterPositions,
  partyLocalPositions,
  0.3,
  partyPositions
); // => 0.3 * 0.75 + 0.7 * 1.0
```

### Validation

In addition, this pacakge comes with some helpful functions for validating your data.

```js
import {
  validatePositions,
  validatePositionsTaken,
  validateOverlappingPositions
} from "@nrk/valg-valgomat-algoritme/validation";

let partyPositions = {
  "1": { value: 1 },
  "2": { value: -1 }
};

let voterPositions = {
  "1": { value: 0 },
  "2": { value: -2 }
};

// Validates that all positions taken are valid positions -2|-1|0|1|2
let maybePositionError = validatePositions(voterPositions);
if (maybeError) {
  // Handle error
}

// Validates that you have taken a position on all statements, i.o.w. no 0s or invalid values
let maybeMissingPosition = validatePositionsTaken(partyPositions);
if (maybeMissingPosition) {
  // Handle error
}

// Validates that both sets of positions are completely overlapping, i.o.w. both sets contains the same set of statements.
let maybeNotOverlapping = validateOverlappingPositions(
  voterPositions,
  partyPositions
);
if (maybeNotOverlapping) {
  // Handle error
}
```

## API

```js
import {
  distance,
  distanceMap,
  distanceMix
} from "@nrk/valg-valgomat-algoritme";
```

### let d = distance(positionsA, positionsB);

Accepts two sets of positions and returns the distance between them.

Positions are given in the form of sets:

```ts
{
  [statement: string]: { value: number }
}
```

Where `value` is in the interval `[-2.0, 2.0]`

Output will be a number in the interval `[0.0, 1.0]` where `0.0` is the largest possible distance and `1.0` is the smallest possible distance (iow. identical).

### let distances = distanceMap(positionsA, positionsMap);

Accepts a set of positions and a map of many sets of positions and returns a map of the distances between a position in the position map and the first position.

This is useful if you want to calculate the distance between one set of positions and many sets of positions. For instance between all parties and a single voter.

Output will be a map from the keys in the positionsMap and the distance to the given position.

### let distance = distanceMix(positionsA, positionsB1, maxRatioAB1, positionsB2);

Accepts three sets of positions and a ratio which applies to the second of the three sets. Returns the distance between the first set of positions to a mix of the two other positions in accordance with the ratio.

The ratio will ensure that the second set will only account for a max fraction of the total distance. If the second set accounts for less than the max fraction that will be used instead.

This function is useful for calculating distances in cases where you have statements from two different pools, for instance a set of local statements and a set of national or ideological statements, and you want them to contribute un-evenly to the total distance .

Output will be a distance which follow the same rules as the output from the `distance`-function.

### Validation

These are helper-methods that can be used to check if a set of positions follow certain assuptions about structure or content.

```js
import {
  validatePositions,
  validatePositionsTaken,
  validateOverlappingPositions
} from "@nrk/valg-valgomat-algoritme/validation";
```

#### let maybeError = validatePositions(positions);

Accepts a set of positions and checks whether the positions taken for the statements included are valid.

A valid position is an integer between `-2` and `2`, including `0`. This will also validate the structure of your data, which might be helpful during development.

The output will be `null` if no errors are found or a formatted error-message.

#### let maybeError = validatePositionsTaken(positions);

Accepts a set of positions and checks whether a position has been taken for all statements. Useful for validating party positions, which have to take a position on all statements.

Skipped statements (the position taken in `0`) or invalid positions (anything that doesn't parse to a number) will result in an error.

The output will be `null` if no errors are found or a formatted error-message.

#### let maybeError = validateOverlappingPositions(positionsA, positionsB);

Accepts two sets of positions and checks whether the sets are totaly overlapping, i.o.w. they include the same sets of statements. This is useful for checking that a voter has taken a position (or skipped) on all the presented statements.

The output will be `null` if no errors are found or a formatted error-message.

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

## License

UNLICENSED
