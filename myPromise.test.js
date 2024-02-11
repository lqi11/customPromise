const myPromise = require("./myPromise")
describe("myPromise", () => {
    it("should handle timeout",()=>{
        const mypromise = new myPromise((resolve,reject)=>{
            setTimeout(()=>{
                resolve(5)
            },1000)
        })
        mypromise.then((data)=>{
            expect(data).toBe(5)
        })
    })
    it("should handle error",()=>{
        const mypromise = new myPromise((resolve, reject)=>{
            setTimeout(()=>{
                reject("error")
            },1000)
        })
        mypromise.catch((error)=>{ 
            expect(error).toBe("error")
        })
    })
})