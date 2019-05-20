function average(...positionsSet) {
  let sumOfPositionSet = positionsSet.reduce(function(sum, positions) {
    for (let statementId in positions) {
      let value = parseFloat(positions[statementId].value);
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
  average
};
