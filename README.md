This is a file to implement a custom Promise.

##myPromise
1. if when promise.then() is called, the result is not ready, it won't run anything. When time is ready, resolve will call process queue again. Resolve and then are two path to run process queue.
2. For the chained then, within then, if fulfilledValue is Prom, fulfilledValue.then need to be called because we need to put Promise.resolve/reject into its queue. Otherwise nothing will give the result in Line 74.