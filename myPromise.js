const STATE = {
    pending,
    fulfilled,
    rejected
}
class CustomPromise {
    constructor(executor){
        this.value=undefined
        this.reason = undefined
        this.status=STATE.pending
        this.fulfilledCallbacks=[]
        this.rejectedCallbacks=[]
        executor(this.resolve.bind(this),this.reject.bind(this))
    }

    resolve(value){
        if(this.status===STATE.pending){
            this.value=value
            this.status=STATE.fulfilled
            this.handleFulfilledCallbacks(this.value)
        }
    }

    reject(reason){  
        if (this.status === STATE.pending) {
            this.reason = reason
            this.status = STATE.rejected
            this.handleRejectedCallbacks(this.reason)
        }
    }

    handleFulfilledCallbacks(value){
        this.fulfilledCallbacks.forEach(callback=>{
            // this first item is callback, the second is new promise
            const curResolvedResult= callback[0](value) // the result of then
            // this is when it returns Promise("5")
            if (curResolvedResult instanceof CustomPromise) {
                // how does this value come from? it should be the second then result
                curResolvedResult.then(value=>{
                    callback[1].resolve(value)
                }, reason=>{
                    callback[1].reject(reason)
                })
            } else {
                // this is normal case, calling resolve on behalf of then
                callback[1].resolve(curResolvedResult)
            }
        })
    }

    handleRejectedCallbacks(reason){ 
        this.rejectedCallbacks.forEach(callback=>{
            const curResolvedResult= callback[0](reason)
            if (curResolvedResult instanceof CustomPromise) {
                curResolvedResult.then(value=>{
                    callback[1].resolve(value)
                }, reason=>{
                    callback[1].reject(reason)
                })
            } else {
                callback[1].reject(curResolvedResult)
            }
        }) 
    }


    then(onFulfilled, onRejected){
        // create a empty promise, this promise doesn't need executor, because this promise will
        // help it bind resolve and reject
        const newPromise = new CustomPromise(()=>{})
        if(this.status===STATE.fulfilled){
            onFulfilled(this.value)
        }
        if(this.status===STATE.rejected){
            onRejected(this.value)
        }
        if(this.status===STATE.pending){
            this.fulfilledCallbacks.push([onFulfilled, newPromise])
            this.rejectedCallbacks.push([onRejected, newPromise])
        }
        return newPromise
    }

}