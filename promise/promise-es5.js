
var PROMISE_STATE = {
    pending: "pending",
    fulfilled: "fulfilled",
    rejected: "rejected"
};

var Util = Object.create(null);
Util.isFunction = function(func){
    return typeof func === "function";
}
Util.isObject = function(obj){
    return Object.prototype.toString.call(obj) === "[object Object]";
}
Util.nextTick = function(func){
    return function(){
        setTimeout(func, 0);
    };
}

function APromise(resolver){
    if(!(this instanceof APromise)){
        throw "APromise must be called by new!";
    }
    
    var state = Object.create(null);
    state.fulfilledCB = [];
    state.rejectedCB = [];
    state.data = undefined;
    state.status = PROMISE_STATE.pending;
    this.state = state;

    function changeState(origin, target, cbs, data){
        if(state.status !== origin){
            return;
        }
        state.status = target;
        state.data = data;
        for(var i=0; i<cbs.length; i++){
            cbs[i](state.data);
        }
    }

    function resolve(value){
        changeState(PROMISE_STATE.pending, PROMISE_STATE.fulfilled, state.fulfilledCB.slice(0), value);
    }

    function reject(reason){
        changeState(PROMISE_STATE.pending, PROMISE_STATE.rejected, state.rejectedCB.slice(0), reason);
    }

    if(Util.isFunction(resolver)){
        try {
            resolver(resolve, reject);
        }
        catch(e){
            reject(e);
        }
    }
}

APromise.prototype.then = function(onFulfilled, onRejected){
    var parent = this;
    !Util.isFunction(onFulfilled) && (onFulfilled=function(value){return value;});
    !Util.isFunction(onRejected) && (onRejected=function(reason){throw reason;});
    var childPromise = new APromise(childResolver);
    function wrapCB(cb, resolve, reject){
        return function(){
            try{
                var x = cb(parent.state.data);
                resolvePromise(childPromise, x, resolve, reject);
            }
            catch(e){
                reject(e);
            }
        }
    }
    function childResolver(resolve, reject){
        var childOnFulfilled = Util.nextTick(wrapCB(onFulfilled, resolve, reject));
        var childOnRejected = Util.nextTick(wrapCB(onRejected, resolve, reject));
        switch (parent.state.status) {
            case PROMISE_STATE.pending:
                parent.state.fulfilledCB.push(childOnFulfilled);
                parent.state.rejectedCB.push(childOnRejected);
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

function resolvePromise(promise, x, resolve, reject){
    var then, once = false;
    if(promise === x){
        reject(TypeError("promise and x refer to the same object"));
        return;
    }
    if(x instanceof APromise){
        x.then(function(y){
            resolvePromise(promise, y, resolve, reject);
        }, reject);
        return;
    }

    if(Util.isObject(x) || Util.isFunction(x)){
        try {
            then = x.then;
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

/**
 * for test cases
 */
if(module && module.exports){
    module.exports.deferred = function(){
        var promise, _resolve, _reject;
        promise = new APromise(function(resolve, reject){
            _resolve = resolve;
            _reject = reject;
        });
        return {
            promise: promise,
            resolve: _resolve,
            reject: _reject
        };
    }
}
