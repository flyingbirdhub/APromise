const { Once, NextTick, IsFunction, IsObject } = require("./promise-util.js");

const PROMISE_STATE = {
    pending: "pending",
    fulfilled: "fulfilled",
    rejected: "rejected"
};

function _Promise(resolver) {
    if (!(this instanceof _Promise)) {
        throw "SelfPromise must be called by new!"
    }

    // 回调队列
    this.fulfilledCB = [],
        this.rejectedCB = [],
        this.state = PROMISE_STATE.pending;
    this.fulfilledValue = undefined, this.rejectedValue = undefined;

    let reject = _reject.bind(this);
    let resolve = _resolve.bind(this);

    if (typeof resolver === "function") {
        try {
            resolver(resolve, reject);
        }
        catch (e) {
            reject(e);
        }
    }
}

function resolvePromise(promise, x, resolve, reject) {
    if (promise === x) {
        reject(TypeError("promise and x refer to the same object"))
    }

    try {
        if (x instanceof _Promise) {
            x.then(resolve, reject);
        }
        else {
            if (IsObject(x) || IsFunction(x)) {
                try {
                    let then = x.then;
                    let once = false;
                    if (IsFunction(then)) {
                        try {
                            then.call(x, function (y) {
                                if (once) {
                                    return;
                                }
                                once = true;
                                resolvePromise(promise, y, resolve, reject);
                            }, function (y) {
                                if (once) {
                                    return;
                                }
                                once = true;
                                reject(y);
                            });
                        }
                        catch (e) {
                            if (once) {
                                return;
                            }
                            else {
                                reject(e);
                            }
                        }
                    }
                    else {
                        resolve(x);
                    }
                }
                catch (e) {
                    reject(e);
                }
            }
            else {
                resolve(x);
            }
        }
    }
    catch(e){
        reject(e);
    }
}

function _reject(reason) {
    if (this.state !== PROMISE_STATE.pending) {
        return;
    }
    this.state = PROMISE_STATE.rejected;
    this.rejectedValue = reason;
    let cbs = this.rejectedCB.slice(0);
    for (let cb of cbs) {
        cb(this.rejectedValue);
    }
    return this;
}

function NeedResolve(value){
    if(value instanceof _Promise){
        return true;
    }

    if(IsFunction(value) || IsObject(value)){
        let obj = Object.getOwnPropertyDescriptor(value, "then");
        if(obj && IsFunction(obj.value)){
            return true;
        }
    }
    return false;
}

function _resolve(value) {
    if (this.state !== PROMISE_STATE.pending) {
        return;
    }
    if(NeedResolve(value)){
        resolvePromise(this, value, this.resolve.bind(this), this.reject.bind(this));
        return this;
    }
    
    this.state = PROMISE_STATE.fulfilled;
    this.fulfilledValue = value;
    let cbs = this.fulfilledCB.slice(0);
    for (let cb of cbs) {
        cb(this.fulfilledValue);
    }
    return this;
}

_Promise.resolved = function (value) {
    let promise = new _Promise();
    return promise.resolve(value);
}

_Promise.rejected = function (reason) {
    let promise = new _Promise();
    return promise.reject(reason);
}

_Promise.prototype.reject = function (reason) {
    return _reject.call(this, reason);
}

_Promise.prototype.resolve = function (value) {
    return _resolve.call(this, value);
}

_Promise.prototype.then = function (onFulfilled, onRejected) {
    !IsFunction(onFulfilled) && (onFulfilled = undefined);
    !IsFunction(onRejected) && (onRejected = undefined);

    let parent = this;
    let promise = new _Promise(function (resolve, reject) {
        if (parent.state === PROMISE_STATE.pending) {
            parent.fulfilledCB.push(NextTick(function () {
                try {
                    if (onFulfilled) {
                        let x = onFulfilled(parent.fulfilledValue);
                        resolvePromise(promise, x, resolve, reject);
                    }
                    else {
                        resolve(parent.fulfilledValue);
                    }
                }
                catch (e) {
                    reject(e);
                }
            }));
            parent.rejectedCB.push(NextTick(function () {
                try {
                    if (onRejected) {
                        let x = onRejected(parent.rejectedValue);
                        resolvePromise(promise, x, resolve, reject);
                    }
                    else {
                        reject(parent.rejectedValue);
                    }
                }
                catch (e) {
                    reject(e);
                }
            }));
        }
        else if (parent.state === PROMISE_STATE.fulfilled) {
            if (!onFulfilled) {
                resolve(parent.fulfilledValue);
            }
            else {
                NextTick(function () {
                    try {
                        let x = onFulfilled(parent.fulfilledValue);
                        resolvePromise(promise, x, resolve, reject);
                    }
                    catch (e) {
                        reject(e);
                    }
                })();
            }
        }
        else if (parent.state === PROMISE_STATE.rejected) {
            if (!onRejected) {
                reject(parent.rejectedValue);
            }
            else {
                NextTick(function () {
                    try {
                        let x = onRejected(parent.rejectedValue);
                        resolvePromise(promise, x, resolve, reject);
                    }
                    catch (e) {
                        reject(e);
                    }
                })();
            }
        }
    });
    return promise;
}

_Promise.prototype.catch = function (onRejected) {
    return this.then(undefined, onRejected);
}

module.exports._Promise = _Promise;
