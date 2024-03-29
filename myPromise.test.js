const Prom = require("./myPromise")
describe("Prom", () => {
    it("should fulfill multiple then of same promise instance", () => {
      const promise = new Prom((resolve) => {
        setTimeout(() => {
          resolve(1000);// which resolve this is? is it the Prom's resolve? Yes
        }, 1000);
      });
  
      promise.then((result) => {
        expect(result).toBe(1000);
      });
  
      promise.then((result) => {
        expect(result).toBe(1000);
      });
    });
    it("should fulfill with a value with setTimeout", () => {
      const promise = new Prom((resolve) => {
        setTimeout(() => {
          resolve(1000);
        }, 1000);
      });
  
      return expect(promise).resolves.toBe(1000);
      // promise.then((result) => {
      //   expect(result).toBe(1000);
      //   done();
      // });
    });
  
    it("should fulfill with a value without setTimeout", () => {
      const promise = new Prom((resolve) => {
        resolve(1000);
      });
      return expect(promise).resolves.toBe(1000);
    });
  
    it("should reject with a reason with setTimeout", () => {
      const promise = new Prom((_, reject) => {
        setTimeout(() => {
          reject(new Error("Something went wrong!"));
        }, 1000);
      });
  
      // promise.catch((err) => {
      //   expect(err.message).toBe("Something went wrong!");
      // });
      return expect(promise).rejects.toThrow("Something went wrong!");
    });
  
    it("should reject with a reason without setTimeout", () => {
      const promise = new Prom((_, reject) => {
        reject(new Error("Something went wrong!"));
      });
  
      return expect(promise).rejects.toThrow("Something went wrong!");
    });
  
    it("should fulfill with a promise value in the chain", () => {
      // api call
      const p1 = new Prom((resolve) => {
        setTimeout(() => {
          resolve(2000); // resolve is called within the executor
        }, 500);
      });
  
      const promise = new Prom((resolve) => {
        resolve(1000);
      });
  
      promise
        .then(() => p1) // promise instance /objet
        .then((result) => {
          expect(result).toBe(2000);
          // done();
        });
  
      promise
        .then(() => p1) // promise instance /objet
        .then((result) => {
          expect(result).toBe(2000);
          // done();
        });
    });
  
    it("should reject with a promise value in the chain", (done) => {
      const p1 = new Prom((_, reject) => {
        setTimeout(() => {
          reject(new Error("Something went wrong!"));
        }, 500);
      });
  
      const promise = new Prom((resolve) => {
        resolve(1000);
      });
  
      promise
        .then(() => p1)
        .catch((error) => {
          expect(error.message).toBe("Something went wrong!");
          done();
        });
    });
  
    it("should chain multiple promises without catch", (done) => {
      const promise = new Prom((resolve) => {
        setTimeout(() => {
          resolve(10);
        }, 1000);
      });
  
      promise
        .then((result) => {
          return result * 2;
        })
        .then((result) => {
          return result + 5;
        })
        .then((result) => {
          expect(result).toBe(25);
          done();
        });
    });
  
    it("should chain multiple promises with catch at the end", (done) => {
      const promise = new Prom((resolve, reject) => {
        setTimeout(() => {
          reject(new Error("Something went wrong!"));
        }, 1000);
      });
  
      promise
        .then((result) => {
          return result * 2;
        })
        .then((result) => {
          return result + 5;
        })
        .catch((error) => {
          expect(error.message).toBe("Something went wrong!");
          done();
        });
    });
  
    it("should chain multiple promises with catch in the middle with reject", (done) => {
      const promise = new Prom((resolve, reject) => {
        setTimeout(() => {
          reject(new Error("Something went wrong!"));
        }, 1000);
      });
  
      promise
        .then((result) => {
          return result * 2;
        })
        .then((result) => {
          return result + 5;
        })
        .catch((error) => {
          return error;
        })
        .then((error) => {
          expect(error.message).toBe("Something went wrong!");
          done();
        });
    });
  
    it("should chain multiple promises with catch in the middle with resolve", (done) => {
      const promise = new Prom((resolve) => {
        setTimeout(() => {
          resolve(1000);
        }, 1000);
      });
      promise
        .catch((e) => {
          console.log(e);
        })
        .then((result) => {
          expect(result).toBe(1000);
          // what does the done do?
          done();
        });
    });
  
    it("should execute finally callback", () => {
      let finallyCallbackExecuted = false;
  
      const promise = new Prom((resolve) => {
        setTimeout(() => {
          resolve(1000);
        }, 1000);
      });
  
      return promise
        .finally((val) => {
          finallyCallbackExecuted = true;
        })
        .then((result) => {
          expect(finallyCallbackExecuted).toBe(true);
          expect(result).toBe(1000);
        });
    });
  
    it("should throw error if the executor is missing", () => {
      try {
        new Prom();
      } catch (error) {
        expect(error.message).toBe("Missing executor");
      }
    });
  
    it("should throw error if the executor is not a function", () => {
      try {
        new Prom(1000);
      } catch (error) {
        expect(error.message).toBe("Executor must be a function");
      }
    });
  
    it("should reject with a reason if executor throws an error", () => {
      const promise = new Prom(() => {
        throw new Error("Something went wrong!");
      });
  
      promise.catch((error) => {
        expect(error.message).toBe("Something went wrong!");
      });
    });
    // test static resolve and reject
    it("should return a given value if a value is resolved", ()=>{
      const value = Prom.resolve(1000)
      value.then((result)=>{
        expect(result).toBe(1000)
      })
    })
    it("should return a promise if a promise is resolved", ()=>{
      const p1 = new Prom((resolve)=>{
        setTimeout(() => {
          resolve(1000);
        }, 1000);
      })
      const value = Prom.resolve(p1)
      value.then((result)=>{
        expect(result).toBe(p1) // why it is the same as p1?
        //because you have called then. value is not the same as p1, but the resolved value is p1
      })
    })
    it("should resolve it when a thenable object put into Prom.resolve", ()=>{
      const thenable = {
        then(resolve){
          setTimeout(()=>{
            resolve(1000) 
          }, 1000)
         // resolve(1000)
        }
      }
      // const thenable = {
      //   then: (resolve)=>{
      //     setTimeout(()=>{
      //       resolve(1000) 
      //     }, 1000)
      //   }
      // }

      
      const value = Prom.resolve(thenable)
      // const value = Prom.resolve({
      //   then(resolve){
      //     resolve(1000)
      //   }
      // })
      value.then((result)=>{
        expect(result).resolves.toBe(1000)
      })
    })
  })
  
  
  