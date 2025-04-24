import tap from 'tap'
import jsc from 'jsverify'

import { proximity, proximityMap } from './algorithm.js'
import { toPositions } from './domain/positions.js'
import { positions as positionsMock } from './__helpers/mocks.js'

/**
 * @callback checkFunction
 * @param {ValgomatAlgoritme.Positions[]} positions
 */

/**
 *
 * @param {checkFunction} check
 * @returns {(vectors: (ValgomatAlgoritme.PositionValue | null)[][]) => boolean}
 */
function arrayToPositionsHelper(check) {
  // The order of keys is not really interesing here,
  // but needed for the algorithm to do its thing.

  return function (vectors) {
    let args = vectors
      .map((vector) =>
        vector.map((v, i) => /** @type {ValgomatAlgoritme.PositionVector} */ ([`${i}`, v])),
      )
      .map((vector) => toPositions(vector))

    return check(args)
  }
}

let arbitraryPositions = jsc.array(jsc.integer(-2, 2))

// Property based tests

tap.test('algorithm is symmetrical', function (t) {
  let arbitraryPositionsPair = jsc.suchthat(
    jsc.pair(arbitraryPositions, arbitraryPositions),
    ([a, b]) => a.length > 10 && b.length > 10,
  )

  /** @type {checkFunction} */
  function check([a, b]) {
    let distanceA = proximity(a, b)
    let distanceB = proximity(b, a)

    return distanceA === distanceB
  }

  let wrappedCheck = arrayToPositionsHelper(check)

  jsc.assert(jsc.forall(arbitraryPositionsPair, wrappedCheck))
  t.end()
})

tap.test('not answered and missing are identical', function (t) {
  let arbitraryPositionsPair = jsc.pair(jsc.array(jsc.constant(null)), jsc.constant([]))

  /** @type {checkFunction} */
  function check([a, b]) {
    return proximity(a, b) === null
  }

  let wrappedCheck = arrayToPositionsHelper(check)

  jsc.assert(jsc.forall(arbitraryPositionsPair, wrappedCheck))
  t.end()
})

tap.test('handles identical set of answered statements', function (t) {
  // Ensure equal length, to have identical sets of answered statements
  let arbitraryPositionsPair = jsc.suchthat(
    jsc.pair(arbitraryPositions, arbitraryPositions),
    ([a, b]) => a.length === b.length,
  )

  /** @type {checkFunction} */
  function check([a, b]) {
    let d = proximity(a, b)

    return d == null || (d <= 1 && d >= 0)
  }

  let wrappedCheck = arrayToPositionsHelper(check)

  jsc.assert(jsc.forall(arbitraryPositionsPair, wrappedCheck))
  t.end()
})

tap.test('handles uneven number of answered statements', function (t) {
  // Ensure un-even length.
  let arbitraryPositionsPair = jsc.suchthat(
    jsc.pair(arbitraryPositions, arbitraryPositions),
    ([a, b]) => a.length !== b.length,
  )

  /** @type {checkFunction} */
  function check([a, b]) {
    let d = proximity(a, b)

    return d == null || (d <= 1 && d >= 0)
  }

  let wrappedCheck = arrayToPositionsHelper(check)

  jsc.assert(jsc.forall(arbitraryPositionsPair, wrappedCheck))
  t.end()
})

// Example based tests
tap.test('both empty', function (t) {
  let a = /** @type {ValgomatAlgoritme.Positions} */ ({})
  let b = /** @type {ValgomatAlgoritme.Positions} */ ({})

  t.ok(proximity(a, b) === null)
  t.end()
})

tap.test('left-empty', function (t) {
  let a = positionsMock(2)
  let b = /** @type {ValgomatAlgoritme.Positions} */ ({})

  t.ok(proximity(a, b) === null)
  t.end()
})

tap.test('right-empty', function (t) {
  let a = /** @type {ValgomatAlgoritme.Positions} */ ({})
  let b = positionsMock(2)

  t.ok(proximity(a, b) === null)
  t.end()
})

tap.test('left just-0s', function (t) {
  let n = 2
  let a = positionsMock(n, () => null)
  let b = positionsMock(n)

  t.ok(proximity(a, b) === null)
  t.end()
})

tap.test('right just-0s', function (t) {
  let n = 2
  let a = positionsMock(n)
  let b = positionsMock(n, () => null)

  t.ok(proximity(a, b) === null)
  t.end()
})

tap.test('both just-0s', function (t) {
  let n = 2
  let a = positionsMock(n, () => null)
  let b = positionsMock(n, () => null)

  t.ok(proximity(a, b) === null)
  t.end()
})

tap.test('left not answered', function (t) {
  let a = toPositions([
    ['0', -2],
    ['1', 1],
    ['2', 2],
  ])
  let b = toPositions([
    ['0', 1],
    ['1', 1],
    ['2', null],
  ])

  t.ok(proximity(a, b) === (8 - 3) / 8)
  t.end()
})

tap.test('left missing', function (t) {
  let a = toPositions([
    ['0', -2],
    ['1', 1],
    ['2', 2],
  ])
  let b = toPositions([
    ['0', 1],
    ['1', 1],
  ])

  t.ok(proximity(a, b) === (8 - 3) / 8)
  t.end()
})

tap.test('right not answered', function (t) {
  let a = toPositions([
    ['0', 1],
    ['1', 1],
    ['2', null],
  ])
  let b = toPositions([
    ['0', -2],
    ['1', 1],
    ['2', 2],
  ])

  t.ok(proximity(a, b) === (8 - 3) / 8)
  t.end()
})

tap.test('right missing', function (t) {
  let a = toPositions([
    ['0', 1],
    ['1', 1],
  ])
  let b = toPositions([
    ['0', -2],
    ['1', 1],
    ['2', 2],
  ])

  t.ok(proximity(a, b) === (8 - 3) / 8)
  t.end()
})

tap.test('both not answered', function (t) {
  let a = toPositions([
    ['0', 1],
    ['1', 1],
    ['2', null],
    ['3', -1],
  ])
  let b = toPositions([
    ['0', -2],
    ['1', 1],
    ['2', 2],
    ['3', null],
  ])

  t.ok(proximity(a, b) === (8 - 3) / 8)
  t.end()
})

tap.test('both missing', function (t) {
  let a = toPositions([
    ['0', 1],
    ['1', 1],
    ['3', -1],
  ])
  let b = toPositions([
    ['0', -2],
    ['1', 1],
    ['2', 2],
  ])

  t.ok(proximity(a, b) === (8 - 3) / 8)
  t.end()
})

tap.test('readme example', function (t) {
  let a = toPositions([
    ['0', 1],
    ['1', -1],
  ])
  let b = toPositions([
    ['0', -2],
    ['1', 2],
  ])

  t.ok(proximity(a, b) === 0.25)
  t.end()
})

tap.test('proximityMap', function (t) {
  tap.test('result includes all ids passed', function (t) {
    let map = {
      1: toPositions([
        ['0', 1],
        ['1', -1],
      ]),
      2: toPositions([
        ['0', 2],
        ['1', -2],
      ]),
    }

    let a = toPositions([
      ['0', 1],
      ['1', -2],
    ])

    let distances = proximityMap(a, map)

    t.same(Object.keys(map), Object.keys(distances))
    t.end()
  })

  tap.test('result include actual distances', function (t) {
    let b1 = toPositions([
      ['0', 1],
      ['1', -1],
    ])
    let b2 = toPositions([
      ['0', 2],
      ['1', -2],
    ])
    let map = { 1: b1, 2: b2 }

    let a = toPositions([
      ['0', 1],
      ['1', -2],
    ])

    let distances = proximityMap(a, map)

    t.ok(distances[1] === proximity(a, b1))
    t.ok(distances[2] === proximity(a, b2))
    t.end()
  })

  tap.test('cannot make proximity larger than 1', function (t) {
    let b1 = toPositions([
      ['0', 1],
      ['1', -1],
    ])
    let b2 = toPositions([
      ['0', 2],
      ['1', -2],
    ])
    let map = { 1: b1, 2: b2 }

    let a = b1

    let distances = proximityMap(a, map)

    t.ok(distances[1] === 1.0)
    t.end()
  })

  tap.test('preserves null logic for unknowable distances', function (t) {
    let b1 = toPositions([
      ['0', 1],
      ['1', -1],
    ])
    let b2 = toPositions([
      ['2', 2],
      ['3', -2],
    ])
    let map = { 1: b1, 2: b2 }

    let a = b1

    let distances = proximityMap(a, map)

    t.ok(distances[1] === 1.0)
    t.ok(distances[2] === null)
    t.end()
  })

  tap.test('readme example', function (t) {
    let a = toPositions([
      ['0', 1],
      ['1', -1],
    ])
    let b = toPositions([
      ['0', 2],
      ['1', -2],
    ])

    let voter = toPositions([
      ['0', null],
      ['1', -2],
    ])

    let distances = proximityMap(voter, { a, b })

    t.ok(distances['a'] === 0.75)
    t.ok(distances['b'] === 1.0)
    t.end()
  })

  t.end()
})
