function SelfPromise(resolver){
    if(!(this instanceof SelfPromise)){
        throw "SelfPromise must be called by new!"
    }

    if(typeof resolver !== "function"){
        throw "resolver is not function!";
    }

    const state = {
        pending: "pending",
        fulfilled: "fulfilled",
        rejected: "rejected"
    };
    let currentState = state.pending;
    let fulfilledCallbacks = [], rejectedCallbacks = [], finalCallbacks=[], fulfilledValue, rejectedValue;

    let reject = once(function reject(reason){
        // 设置状态
        if(currentState !== state.pending){
            return;
        }
        currentState = state.rejected;
        rejectedValue = reason;
        let callbacks = rejectedCallbacks.slice();
        callbacks.push(...finalCallbacks);
        for(let callback of callbacks){
            if(typeof callback === "function"){
                rejectedValue = callback(rejectedValue);
            }
        }
    });

    let resolve = once(function resolve(value){
        if(currentState !== state.pending){
            return;
        }
        currentState = state.fulfilled;
        fulfilledValue = value;
        let callbacks = fulfilledCallbacks.slice();
        callbacks.push(...finalCallbacks);
        for(let callback of callbacks){
            if(typeof callback === "function"){
                fulfilledValue = callback(fulfilledValue);
            }
        }
    });

    this.then = function then(onFulfilled, onRejected){
        if(typeof onFulfilled !== "function"){
            return;
        }
        if(typeof onRejected !== "function" && typeof onRejected !== "undefined"){
            onRejected = undefined;
        }
        if(currentState === state.pending){
            fulfilledCallbacks.push(onFulfilled);
            onRejected && rejectedCallbacks.push(onRejected);
        }
        else if(currentState === state.fulfilled){
            fulfilledValue = onFulfilled(fulfilledValue);
        }
        else if(currentState === state.rejected && onRejected){
            onRejected && (rejectedValue = onRejected(rejectedValue));
        }
        return this;
    }

    this.catch = function _catch(onRejected){
        if(typeof onRejected !== "function"){
            return;
        }
        if(currentState === state.pending){
            this.rejectedCallbacks.push(onRejected);
        }
        else if(currentState === state.rejected){
            rejectedValue = onRejected(rejectedValue);
        }
        return this;
    }

    this.finally = function _finally(onFinally){
        if(typeof onFinally !== "function"){
            return;
        }
        if(currentState === state.pending){
            this.finalCallbacks.push(onFinally);
        }
        else if(currentState === state.rejected){
            rejectedValue = onFinally(rejectedValue);
        }
        else if(currentState === state.fulfilled){
            fulfilledValue = onFinally(fulfilledValue);
        }
        return this;
    }

    // 立即调用resolve
    try {
        resolver(resolve, reject);
    }
    catch(e){
        reject(e);
    }
}

function once(func){
    let executed = false;
    return function(params){
        if(executed){
            return;
        }
        executed = true;
        if(typeof func === "function"){
            func(params);
        }
    }
}

exports.default = SelfPromise;