function average(...positionsSet) {
  let weights = Array(positionsSet.length).fill(1);

  return weightedAverage(weights, ...positionsSet);
}

function weightedAverage(weights, ...positionsSet) {
  if (weights.length !== positionsSet.length) {
    throw new Error("Need weights for all sets of positions");
  }

  let sumOfPositionSet = positionsSet.reduce(function(sum, positions, index) {
    let weight = weights[index];
    for (let statementId in positions) {
      let value = weight * parseFloat(positions[statementId].value);
      if (!sum[statementId]) {
        sum[statementId] = value;
      } else {
        sum[statementId] += value;
      }
    }

    return sum;
  }, {});

  let statementIds = Object.keys(sumOfPositionSet);
  let averagePositions = statementIds.reduce(function(average, statementId) {
    let value = sumOfPositionSet[statementId] / positionsSet.length;
    average[statementId] = { value: Math.round(value * 100) / 100 };
    return average;
  }, {});

  return averagePositions;
}

module.exports = {
  average,
  weightedAverage,
};
