const MAX_DIST = 2.0 - -2.0;

function pipe(...fns) {
  return function(x) {
    return fns.reduce((v, f) => f(v), x);
  };
}

function zipByIds(ids, vectorA, vectorB) {
  return ids.map(function(id) {
    let a = vectorA.find(([statementId]) => statementId === id);
    let b = vectorB.find(([statementId]) => statementId === id);

    return [a[1], b[1]];
  });
}

function difference([a, b]) {
  return Math.abs(a - b);
}

function sum(s, v) {
  return s + v;
}

function filterNotAnswered(vector) {
  return vector.filter(function([, position]) {
    return position !== 0;
  });
}

function set(vector) {
  return vector.map(([id]) => id);
}

function union(setA, setB) {
  return setA.filter(id => setB.includes(id));
}

function positionsToVector(positions) {
  return Object.keys(positions).map(statementId => [
    statementId,
    parseFloat(positions[statementId].value)
  ]);
}

function distance(positionsA, positionsB) {
  let processPositions = pipe(
    positionsToVector,
    filterNotAnswered
  );

  let vectorA = processPositions(positionsA);
  let vectorB = processPositions(positionsB);

  let answeredStatements = union(set(vectorA), set(vectorB));

  if (answeredStatements.length === 0) {
    // NOTE:
    // This is technically wrong, but in line with old algorithm.
    // Normally, an empty vector would get a distance of 0%,
    // since the difference between [] and [] is 0.
    // This is not a common case, but kept for historical reasons.
    return 0;
  }

  let distance = zipByIds(answeredStatements, vectorA, vectorB)
    .map(difference)
    .reduce(sum);

  let maxPossibleDistance = answeredStatements.length * MAX_DIST;

  return (maxPossibleDistance - distance) / maxPossibleDistance;
}

module.exports = {
  distance
};
