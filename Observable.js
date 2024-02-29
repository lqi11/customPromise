// executor
function executor(observer){
    let count = 0

    const timer = setInterval(()=>{
        if (count < 10){
            observer.next(count++)
        } else {
            clearInterval()
        }
    }, 1000)

    return function(){
        clearInterval(timer)
    }
}

const myObserver = {
    next(data){
        console.log(`received data`, data)
    },

    error(err) {
        console.log(`received error`, err)
    },
    complete(){
        console.log(`completed.`)
    }
}

class Subscription {
    constructor(){
        this.subscriber = []
    }
    unsubscribe(){
        this.subscriber.forEach(tearDown => tearDown())
        this.subscriber = []
    }
    add(tearDown){
        this.subscriber.push(tearDown)
    }
}

class SafeObserver{
    constructor(observer, subscription){
        this.isComplete = false
        this.observer = observer
        this.subscription = subscription
    }

    next(data){
        if (!this.isComplete){
            this.observer.next(data)
        }
    }

    error(err){
        if(!this.isComplete){
            this.observer.error(err)
        }
    }

    complete(){
        this.isComplete = true
        this.subscription.unsubscribe()
    }
}

class Observable{
    constructor(executor){
        this.executor = executor
    }

    subscribe(observer){
        const subscription = new Subscription(observer)
        const safeObserver = new SafeObserver(observer, subscription)
        const tearDown = this.executor(safeObserver)

        subscription.add(tearDown)
        return subscription
    }
}
const myObservable= new Observable(executor) //publisher
const subscription = myObservable.subscribe(myObserver) // subscribe observer

