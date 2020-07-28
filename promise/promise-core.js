const {Once} = require("./promise-util.js");

const PROMISE_STATE = {
    pending: "pending",
    fulfilled: "fulfilled",
    rejected: "rejected"
};

function _Promise(resolver){
    if(!(this instanceof _Promise)){
        throw "SelfPromise must be called by new!"
    }

    // 回调队列
    this.fulfilledCB = [],
    this.rejectedCB = [],
    this.state = PROMISE_STATE.pending;
    this.fulfilledValue = undefined, this.rejectedValue = undefined;
    
    let reject = Once(_reject.bind(this));
    let resolve = Once(_resolve.bind(this));

    if(typeof resolver === "function"){
        try {
            resolver(resolve, reject);
        }
        catch(e){
            reject(e); 
        }
    }
}

function _reject(reason){
    if(this.state !== PROMISE_STATE.pending){
        return;
    }
    this.state = PROMISE_STATE.rejected;
    this.rejectedValue = reason;
    let cbs = this.rejectedCB.slice(0);
    for(let cb of cbs){
        if(typeof cb === "function"){
            try {
                this.rejectedValue = cb(this.rejectedValue);
            }
            catch(e){
                return _Promise.rejected(e);
            }
        }
    }
    return this;
}

function _resolve(value) {
    if(this.state !== PROMISE_STATE.pending){
        return;
    }
    this.state = PROMISE_STATE.fulfilled;
    this.fulfilledValue = value;
    let cbs = this.fulfilledCB.slice(0);
    for(let cb of cbs){
        if(typeof cb === "function"){
            try {
                this.fulfilledValue = cb(this.fulfilledValue);
            }
            catch(e){
                return _Promise.rejected(e);
            }
        }
    }
    return this;
}

_Promise.resolves = function(value){
    let promise = new _Promise();
    return promise.resolve(value);
}

_Promise.rejected = function(reason){
    let promise = new _Promise();
    return promise.reject(reason);
}

_Promise.prototype.reject = function promiseReject(reason){
    return _reject.call(this, reason);
}

_Promise.prototype.resolve = function promiseResolve(value){
    return _resolve.call(this, value);
}

_Promise.prototype.then = function _then(onFulfilled, onRejected) {
    if(typeof onFulfilled !== "function"){
        onFulfilled = undefined;
    }
    if(typeof onRejected !== "function"){
        onRejected = undefined;
    }

    if(!onFulfilled){
        return this;
    }
    if(this.state === PROMISE_STATE.pending){
        onFulfilled && this.fulfilledCB.push(onFulfilled);
        onRejected && this.rejectedCB.push(onRejected);
    }
    else if(this.state === PROMISE_STATE.fulfilled && onFulfilled){
        try {
            this.fulfilledValue = onFulfilled(this.fulfilledValue);
        }
        catch(e){
            return _Promise.rejected(e);
        }
    }
    else if(this.state === PROMISE_STATE.rejected && onRejected){
        try {
            this.rejectedValue = onRejected(this.rejectedValue);
        }
        catch(e){
            return _Promise.rejected(e);
        }
    }
    return this;
}

_Promise.prototype.catch = function _catch(onRejected){
    if(!onRejected){
        return this;
    }
    if(this.state === PROMISE_STATE.pending){
        onRejected && this.rejectedCB.push(onRejected);
    }
    else if(this.state === PROMISE_STATE.rejected && onRejected){
        try {
            this.rejectedValue = onRejected(this.rejectedValue);
        }
        catch(e){
            return _Promise.rejected(e);
        }
    }
    return this; 
}

module.exports._Promise = _Promise;
