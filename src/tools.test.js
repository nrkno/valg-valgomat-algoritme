const tap = require("tap");
const jsc = require("jsverify");
const { strict } = require("tcompare");

const { validatePositions } = require("./validation.js");

const { average } = require("./tools.js");
const { toPositions } = require("./domain/positions.js");

const { positions: positionsMock } = require("./__helpers/mocks.js");

tap.test("average should validate", function(t) {
  let positionsA = positionsMock({ n: 5 });
  let positionsB = positionsMock({ n: 5 });

  let avg = average(positionsA, positionsB);

  t.ok(validatePositions(avg));
  t.end();
});

tap.test("average should be correct", function(t) {
  let positionsA = toPositions([[0, 2], [1, 1], [2, 0], [3, -1], [4, -2]]);
  let positionsB = toPositions([[0, -2], [1, -1], [2, 0], [3, 1], [4, 2]]);

  let avg = average(positionsA, positionsB);

  t.strictSame(avg, {
    0: { value: 0 },
    1: { value: 0 },
    2: { value: 0 },
    3: { value: 0 },
    4: { value: 0 }
  });
  t.end();
});

tap.test("average of identicals should be identical", function(t) {
  let arbitraryPositions = jsc.suchthat(
    jsc.array(jsc.number(-2, 2)),
    a => a.length > 10
  );

  function check(vector) {
    let positions = toPositions(
      vector.map((v, i) => [i, Math.round(v * 100) / 100])
    );
    let positionsSet = Array(5).fill(positions);
    let avg = average(...positionsSet);

    let res = strict(positions, avg);

    return res.match;
  }

  jsc.assert(jsc.forall(arbitraryPositions, check));
  t.end();
});
