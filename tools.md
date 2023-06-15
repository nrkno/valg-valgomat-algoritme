# Tools

This package also comes with some handy tools to preform some operations that are useful in the context of distance-meassuring.

## Usage

```js
import { average, weightedAverage } from "@nrk/valg-valgomat-algoritme/tools";

let partyAPositions = {
  "1": { value: 1 },
  "2": { value: -1 },
};

let partyBPositions = {
  "1": { value: 2 },
  "2": { value: -2 },
};

// Calculates the average positions of a set of positions
let avg = average(partyAPositions, partyBPositions); // { "1": 1.5, "2": -1.5 }

// You could also do a weighted average
let weightedAvg = weightedAverage([1.5, 1], partyAPositions, partyBPositions); // {"1": 1.75, "2": -1.75}
```

## API

These are helper-functions that combine or operate on positions or sets of positions.

```js
import { average, weightedAverage } from "@nrk/valg-valgomat-algoritme/tools";
```

### let avg = average(...manyPositions);

Accepts arbitrarily many sets of positions and calculates the average poisition for all positions in the sets.

Assumes that all positions are overlapping.

### let avg = weightedAverage(weights, ...manyPositions);

Accepts a set of weights and arbitrarily many sets of positions and calculates the average poisition for all positions in the sets. Must provide weights for all sets of positions passed (`weights.length === manyPositions.length`).
