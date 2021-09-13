export default function deferPromise() {
  let resolve
  let reject
  const promise = new Promise((_resolve, _reject) => {
    resolve = _resolve
    reject = _reject
  })

  return {
    then: f => promise.then(f),
    callback: (err, ...data) => (err ? reject(err) : resolve(data)),
    promise,
  }
}
