# Valg Valgomat Algorithm

> Calculate the distance betwen two sets of positions.

Calculates the distance between two sets of positions. Mostly used to calculate the distance between various party positions and a voter position.

## Usage

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
import { distance } from "@nrk/valg-valgomat-algoritme";
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
