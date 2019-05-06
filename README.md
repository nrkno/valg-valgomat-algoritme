# Valg Valgomat Algorithm

> Calculate the distance betwen two sets of positions.

Calculates the distance between two sets of positions. Mostly used to calculate the distance between various party positions and a voter position.

## Usage

```js
import { calculateDistance } from "@nrk/valg-valgomat-algoritme";

let partyPositions = {
  "1": { value: 1 },
  "2": { value: -1 }
};

let voterPositions = {
  "1": { value: 0 },
  "2": { value: -2 }
};

let distance = calculateDistance(partyPositions, voterPositions); // => 0.75
```

## API

```js
import { calculateDistance } from "@nrk/valg-valgomat-algoritme";
```

### let distance = calculateDistance(positionsA, positionsB);

Accepts two sets of positions and returns the distance between them.

Positions are given in the form of sets:

```ts
{
  [statement: string]: { value: number }
}
```

Where `value` is in the interval `[-2.0, 2.0]`

Output will be a number in the interval `[0.0, 1.0]` where `0.0` is the largest possible distance and `1.0` is the smallest possible distance (iow. identical).

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
