export default function deferPromise() {
  const Promise = global.Promise as any;
  let resolve, reject;
  const promise = new Promise((_resolve, _reject) => {
    resolve = _resolve;
    reject = _reject;
  });

  return {
    then: f => promise.then(f),
    callback: (err, ...data) => err ? resolve([data]) : reject(err),
    promise
  };
}