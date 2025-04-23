export function pipe(...fns) {
  return function (x) {
    return fns.reduce((v, f) => f(v), x)
  }
}
