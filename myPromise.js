const states = {
    pending: "pending",
    fulfilled: "fulfilled",
    rejected: "rejected"
  };
  
class Prom {
    constructor(executor) {
      if (typeof executor === "undefined") {
        throw new Error("Missing executor");
      }
  
      if (typeof executor !== "function") {
        throw new Error("Executor must be a function");
      }
  
      this.promiseState = states.pending;
      this.result = null;
      this.fulfilledCallBacks = [];
      this.rejectedCallBacks = [];
  
      try {
        executor(this.resolve.bind(this), this.reject.bind(this));
      } catch (err) {
        this.reject.call(this, err);
      }
    }
    static resolve(value){
      return new Prom((resolve)=>{
        resolve(value)
      })
    }
    static reject(reason){
      return new Prom((resolve, reject)=>{
        reject(reason)
      })
    }
  
    then(fulfilledCallback, rejectedCallBack) {
      const promise = new Prom(() => {});
      if (typeof fulfilledCallback === "function") {
        this.fulfilledCallBacks.push([fulfilledCallback, promise]);
      }
      if (typeof rejectedCallBack === "function") {
        this.rejectedCallBacks.push([rejectedCallBack, promise]);
      }
      this.processQueue();
      return promise;
    }
  
    catch(rejectedCallBack) {
      return this.then(undefined, rejectedCallBack);
    }
  
    finally(finallyCb) {
      return this.then(
        (res) => {
          finallyCb();
          return res;
        },
        (err) => {
          finallyCb();
          throw err;
        }
      );
    }
  
    resolve(value) {
      if (this.promiseState !== states.pending) {
        throw new Error("Promise is already settled.");
      }
      this.result = value;
      this.promiseState = states.fulfilled;
      this.processQueue();
    }
  
    reject(reason) {
      if (this.promiseState !== states.pending) {
        throw new Error("Promise is already settled.");
      }
      this.result = reason;
      this.promiseState = states.rejected;
      this.processQueue();
    }
  
    processQueue() {
      switch (this.promiseState) {
        // what if the state is pending?
        case states.fulfilled:
          this.processFulfilledState();
          break;
        case states.rejected:
          this.processRejectedCallState();
          break;
      }
    }
  
    processFulfilledState() {
      if (this.fulfilledCallBacks.length) {
        // case where there is then block in fulfilled state
        for (const [fulfilledCallback, promise] of this.fulfilledCallBacks) {
          const fulfilledValue = fulfilledCallback(this.result); // what if it is null? for example in the first test.
          //fulfilledValue = p1
          if (fulfilledValue instanceof Prom) {
            fulfilledValue.then( // whose then it is?, is it the same as line 74?
              (val) => promise.resolve(val),
              (err) => promise.reject(err)
            );
          } else {
            promise.resolve(fulfilledValue);
          }
        }
      } else if (this.rejectedCallBacks.length) {
        // case where there is catch block in fulfilled state
        for (const [_, promise] of this.rejectedCallBacks) {
          promise.resolve(this.result);
        }
      }
      this.clearQueue();
    }
  
    processRejectedCallState() {
      if (this.rejectedCallBacks.length) {
        // case where there is catch block in rejected state
        for (const [rejectedCallBack, promise] of this.rejectedCallBacks) {
          const rejectedValue = rejectedCallBack(this.result);
  
          if (rejectedValue instanceof Prom) {
            rejectedValue.then(
              (val) => promise.resolve(val),
              (err) => promise.reject(err)
            );
          } else {
            promise.resolve(rejectedValue);
          }
        }
      } else if (this.fulfilledCallBacks.length) {
        // case where there is then block in rejected state
        for (const [_, promise] of this.fulfilledCallBacks) {
          promise.reject(this.result);
        }
      }
      this.clearQueue();
    }
  
    clearQueue() {
      this.fulfilledCallBacks = [];
      this.rejectedCallBacks = [];
    }
  }
  module.exports = Prom