/**
 * extension for promise, provide util function
 */
const {APromise} = require("./promise-core.js");

/**
 * for onRejected handle
 */
APromise.prototype.catch = function(onRejected) {
    return this.then(undefined, onRejected);
}

/**
 * for onFulfilled and onRejected handle
 */
APromise.prototype.all = function(func){
    return this.then(func, func);
}

/**
 * util for APromise self
 */
// create a promise with state fulfilled
APromise.resolved = function(value){
    return new APromise(function(resolve){
        resolve(value);
    });
}

// create a promise with state rejected
APromise.rejected = function(reason){
    return new APromise(function(resolve, reject){
        reject(reason);
    });
}

// race for function
APromise.race = function(...cbs){
    let _resolve, _reject, once = false;
    for(let cb of cbs){
        new Promise(cb).then(function(value){
            if(once){
                return;
            }
            once = true;
            _resolve(value);
        }, function(reason){
            if(once){
                return;
            }
            once = true;
            _reject(reason);
        });
    }
    return new Promise(function(resolve, reject){
        _resolve = resolve;
        _reject = reject;
    });
}

// all done for function
APromise.all = function(...cbs){
    let count = cbs.length, _reject, _resolve, error=false;
    for(let cb of cbs){
        new Promise(cb).then(function(value){
            if(error || count == 0){
                return;
            }
            count -= 1;
            if(count == 0){
                _resolve(value);
            }
        }, function(reason){
            if(error){
                return;
            }
            error = true;
            _reject(reason);
        });
    }
    return new Promise(function(resolve, reject){
        _resolve = resolve;
        _reject = reject;
    });
}

module.exports.APromise = APromise;
