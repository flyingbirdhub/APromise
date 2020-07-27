const {Once} = require("./promise-util.js");

const PROMISEPROMISE_STATE = {
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
    this.state = PROMISEPROMISE_STATE.pending;
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
    if(this.state !== PROMISEPROMISE_STATE.pending){
        return;
    }
    this.state = PROMISEPROMISE_STATE.rejected;
    this.rejectedValue = reason;
    let cbs = this.rejectedCB.slice(0);
    for(let cb of cbs){
        if(typeof cb === "function"){
            this.rejectedValue = cb(this.rejectedValue);
        }
    }
}

function _resolve(value) {
    if(this.state !== PROMISEPROMISE_STATE.pending){
        return;
    }
    this.state = PROMISEPROMISE_STATE.fulfilled;
    this.fulfilledValue = value;
    let cbs = this.fulfilledCB.slice(0);
    for(let cb of cbs){
        if(typeof cb === "function"){
            this.fulfilledValue = cb(this.fulfilledValue);
        }
    }
}

_Promise.prototype.reject = function promiseReject(reason){
    _reject.call(this, reason);
    return this;
}

_Promise.prototype.resolve = function promiseResolve(value){
    _resolve.call(this, value);
    return this;
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
        this.fulfilledValue = onFulfilled(this.fulfilledValue);
    }
    else if(this.state === PROMISE_STATE.rejected && onRejected){
        this.rejectedValue = onRejected(this.rejectedValue);
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
        this.rejectedValue = onRejected(this.rejectedValue);
    }
    return this; 
}

module.exports._Promise = _Promise;
