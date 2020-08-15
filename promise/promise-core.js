/**
 * core (create a promise, add then method, resolve promise)
 */
const { Util } = require("./promise-util.js");

const PROMISE_STATE = {
    pending: "pending",
    fulfilled: "fulfilled",
    rejected: "rejected"
};

function APromise(resolver) {
    if (!(this instanceof APromise)) {
        throw "APromise must be called by new!"
    }

    // define property on APromise Object
    this.fulfilledCB = [], this.rejectedCB = [], this.status = PROMISE_STATE.pending, this.data = undefined;

    if (typeof resolver === "function") {
        try {
            resolver(resolve.bind(this), reject.bind(this));
        }
        catch (e) {
            (reject.bind(this))(e);
        }
    }
}

APromise.prototype.then = function (onFulfilled, onRejected) {
    !Util.isFunction(onFulfilled) && (onFulfilled = function(value){
        return value;
    });
    !Util.isFunction(onRejected) && (onRejected = function(reason){
        throw reason;
    });

    let parent = this;
    let childPromise = new APromise(childResolver);
    function childResolver(resolve, reject){
        let childCB = function(cb){
            return function(){
                try {
                    let x = cb(parent.data);
                    resolvePromise(childPromise, x, resolve, reject);
                }
                catch(e){
                    reject(e);
                }
            }
        };
        let childOnFulfilled = Util.nextTick(childCB(onFulfilled));
        let childOnRejected = Util.nextTick(childCB(onRejected));
        switch (parent.status) {
            case PROMISE_STATE.pending:
                parent.fulfilledCB.push(childOnFulfilled);
                parent.rejectedCB.push(childOnRejected);
                break;
            case PROMISE_STATE.rejected:
                childOnRejected();
                break;
            case PROMISE_STATE.fulfilled:
            default:
                childOnFulfilled();
        }
    }
    return childPromise;
}

function reject(reason){
    (changeState.bind(this))(PROMISE_STATE.pending, PROMISE_STATE.rejected, reason, this.rejectedCB.slice(0));
}

function resolve(value){
    (changeState.bind(this))(PROMISE_STATE.pending, PROMISE_STATE.fulfilled, value, this.fulfilledCB.slice(0));
}

function changeState(origin, target, data, cbs){
    if(this.status !== origin){
        return;
    }
    this.status = target;
    this.data = data;
    for(let cb of cbs){
        cb(this.data);
    }
}

function resolvePromise(promise, x, resolve, reject) {
    if (promise === x) {
        reject(TypeError("promise and x refer to the same object"))
        return;
    }

    if (x instanceof APromise) {
        x.then(function(y){
            resolvePromise(promise, y, resolve, reject);
        }, reject);
        return;
    }

    if(Util.isObject(x) || Util.isFunction(x)){
        let once = false;
        try {
            let then = x.then;
            if(Util.isFunction(then)){
                then.call(x, function(y){
                    if(once){
                        return;
                    }
                    once = true;
                    resolvePromise(promise, y, resolve, reject);
                }, function(reason){
                    if(once){
                        return;
                    }
                    once = true;
                    reject(reason);
                });
            }
            else {
                resolve(x);
            }
        }
        catch(e){
            if(once){
                return;
            }
            once = true;
            reject(e);
        }
        return;
    }

    resolve(x);
}

module.exports.APromise = APromise;
