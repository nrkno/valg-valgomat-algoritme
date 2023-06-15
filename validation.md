# Validation

This pacakge also includes some helpful functions for validating the data that goes into the algorithm.

## Usage

```js
import {
  validatePositions,
  validatePositionsTaken,
  validateOverlappingPositions,
} from "@nrk/valg-valgomat-algoritme/validation";

let partyPositions = {
  "1": { value: 1 },
  "2": { value: -1 },
};

let voterPositions = {
  "1": { value: 0 },
  "2": { value: -2 },
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
  validatePositions,
  validatePositionsTaken,
  validateOverlappingPositions,
} from "@nrk/valg-valgomat-algoritme/validation";
```

### let maybeError = validatePositions(positions);

Accepts a set of positions and checks whether the positions taken for the statements included are valid.

A valid position is an integer between `-2` and `2`, including `0`. This will also validate the structure of your data, which might be helpful during development.

The output will be `null` if no errors are found or a formatted error-message.

### let maybeError = validatePositionsTaken(positions);

Accepts a set of positions and checks whether a position has been taken for all statements. Useful for validating party positions, which have to take a position on all statements.

Statements with no position (the position taken is `0`) or invalid positions (anything that doesn't parse to a number) will result in an error.

The output will be `null` if no errors are found or a formatted error-message.

### let maybeError = validateOverlappingPositions(positionsA, positionsB);

Accepts two sets of positions and checks whether the sets are totaly overlapping, i.o.w. they include the same sets of statements. This is useful for checking that a voter has taken a position (or skipped) on all the presented statements.

The output will be `null` if no errors are found or a formatted error-message.
